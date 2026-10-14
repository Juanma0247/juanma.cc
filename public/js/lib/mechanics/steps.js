// Prints the output of algebra.solve as a worked solution: the data (with any
// unit conversion), the unknowns, one card per step with the equation used and
// why, the isolation, the substitution and the boxed result, and finally what
// could not be found or did not add up.

import { h, t, fill, tex, texNum, unitTex, unitsOf } from './core.js'
import { eqTex, eqTexNum, rowTex, exprTex, valueTex } from './algebra.js'

const symOf = (vars, u) => vars[u]?.tex ?? u
const listSyms = (vars, us) => us.map(u => `\\(${symOf(vars, u)}\\)`).join(', ')

// Label of an equation as printed in the invariant box: (1), (2)…
export function eqLabel(system, id) {
  const i = system.eqs.findIndex(e => e.id === id)
  const e = system.eqs[i]
  return e?.label ?? `(${i + 1})`
}

const proseLabel = (system, id) => `\\(${eqLabel(system, id)}\\)`

function mathify(el) {
  // Inline \( … \) produced by the templates below.
  el.querySelectorAll('[data-tex]').forEach(n => { n.innerHTML = tex(n.dataset.tex, n.dataset.display === '1') })
  el.querySelectorAll('.mxProse').forEach(n => {
    n.innerHTML = n.innerHTML.replace(/\\\((.+?)\\\)/g, (_, src) => tex(src.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')))
  })
}

const disp = src => h('div', { class: 'mxEq', 'data-tex': src, 'data-display': '1' })
const prose = html => h('p', { class: 'mxProse', html })

export function renderGivens(container, { vars, panel, given, extra = [] }) {
  const chips = []
  for (const name of panel.order) {
    if (!(name in given)) continue
    const spec = vars[name]
    const raw = panel.raw?.[name]
    const si = valueTex(name, given[name], vars, siId(spec.dim))
    let src = `${symOf(vars, name)} = ${si}`
    if (raw && raw.unit && raw.unit !== siId(spec.dim) && spec.dim !== 'angle') {
      src = `${symOf(vars, name)} = ${texNum(raw.value)}\\,${unitTex(spec.dim, raw.unit)} = ${si}`
    }
    if (panel.locks[name]) src += `\\;\\;\\text{(${t('common.steps.condition', 'condition')})}`
    chips.push(h('span', { class: 'mxChip', 'data-tex': src }))
  }
  for (const src of extra) chips.push(h('span', { class: 'mxChip', 'data-tex': src }))
  container.append(...chips)
}

const siId = dim => (dim === 'angle' ? 'deg' : unitsOf(dim)[0].id)

// result: output of solve; ctx: { system, panel, given, asked, why(eq,u,known) }
export function renderSolution(container, result, ctx) {
  const { system, panel, asked = new Set() } = ctx
  const vars = system.vars
  container.innerHTML = ''

  const head = h('div', { class: 'mxSolHead' })
  const givenBox = h('div', { class: 'mxChips' })
  renderGivens(givenBox, { vars, panel, given: ctx.given, extra: ctx.extraGiven })
  head.append(h('div', { class: 'mxSolBlock' }, h('h4', { class: 'mxSolTitle' }, t('common.steps.data', 'Data')), givenBox))

  const all = ctx.allGiven ?? ctx.given
  const used = new Set(system.eqs.flatMap(e => [...e.L, ...e.R].flatMap(term => term.f.map(f => f.v))))
  ctx.extraNames = Object.keys(vars).filter(n => !panel.order.includes(n) && !(n in all) && used.has(n))
  const unknownNames = [...panel.order.filter(n => !(n in ctx.given)), ...ctx.extraNames]
  if (unknownNames.length) {
    const box = h('div', { class: 'mxChips' })
    for (const n of unknownNames) {
      box.append(h('span', { class: `mxChip mxChip--unknown${asked.has(n) ? ' is-asked' : ''}`, 'data-tex': `${symOf(vars, n)} = \\,?` }))
    }
    head.append(h('div', { class: 'mxSolBlock' }, h('h4', { class: 'mxSolTitle' }, t('common.steps.unknowns', 'Unknowns')), box))
  }
  container.append(head)

  const branches = result.branches
  if (branches.length > 1) {
    const tabs = h('div', { class: 'seg-ctrl mxBranchTabs', role: 'tablist' })
    const bodies = branches.map((br, i) => {
      const b = h('div', { class: 'mxBranch', hidden: i !== 0 })
      renderBranch(b, br, ctx, i)
      return b
    })
    branches.forEach((br, i) => {
      const tab = h('button', { class: `seg-opt${i === 0 ? ' is-active' : ''}`, type: 'button', role: 'tab' },
        ctx.branchName ? ctx.branchName(br, i) : fill(t('common.steps.solutionN', 'Solution {n}'), { n: i + 1 }))
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.seg-opt').forEach(o => o.classList.remove('is-active'))
        tab.classList.add('is-active')
        bodies.forEach((b, j) => { b.hidden = j !== i })
        ctx.onBranch?.(i)
      })
      tabs.append(tab)
    })
    container.append(prose(t('common.steps.twoSolutions', 'The statement admits more than one physically valid answer; each tab follows one of them.')), tabs, ...bodies)
  } else if (branches.length) {
    const b = h('div', { class: 'mxBranch' })
    renderBranch(b, branches[0], ctx, 0)
    container.append(b)
  }
  mathify(container)
}

function renderBranch(el, br, ctx, bi) {
  const { system } = ctx
  const vars = system.vars
  const steps = br.steps
  if (!steps.length && !br.unresolved.length) {
    el.append(prose(t('common.steps.nothingToDo', 'Every quantity is already given; there is nothing left to solve.')))
  }
  steps.forEach((s, i) => el.append(stepCard(s, i, ctx)))

  if (br.fail) {
    const u = br.fail.unknown
    el.append(h('div', { class: 'mxAlert mxAlert--bad' },
      prose(fill(t('common.steps.noPhysical', 'There is no physically valid value of {u} for these data: {why}'), {
        u: `\\(${symOf(vars, u)}\\)`,
        why: failReason(br.fail, vars),
      }))))
  }

  if (!br.fail && br.unresolved.length) {
    const asked = ctx.asked ?? new Set()
    const missing = ctx.panel.order.filter(n => br.unresolved.includes(n) && (!vars[n]?.optional || asked.has(n)))
    if (missing.length) {
      el.append(h('div', { class: 'mxAlert' },
        prose(fill(t('common.steps.missing', 'The data are not enough to find {list}. Add one more datum: the model has as many independent equations as quantities it can fix, and every extra known quantity removes one degree of freedom.'), {
          list: listSyms(vars, missing),
        }))))
    }
  }

  if (br.inconsistent?.length) {
    const first = br.inconsistent[0]
    const e = system.eqs.find(x => x.id === first.eqId)
    el.append(h('div', { class: 'mxAlert mxAlert--bad' },
      prose(fill(t('common.steps.inconsistent', 'The data are inconsistent: they do not satisfy equation {eq}. With the values given its two sides differ, so one datum contradicts the others. Leave one of them empty and let the solver compute it.'), {
        eq: `\\(${eqLabel(system, first.eqId)}\\;\\; ${eqTex(e, vars)}\\)`,
      })),
      disp(eqTexNum(e, vars, br.values, new Set(Object.keys(br.values))))))
  }

  if (!br.fail && steps.length) {
    const res = h('div', { class: 'mxResults' })
    const asked = ctx.asked ?? new Set()
    for (const n of [...ctx.panel.order, ...(ctx.extraNames ?? [])]) {
      if (n in ctx.given || !Number.isFinite(br.values[n])) continue
      const spec = vars[n]
      const unit = ctx.panel.rows[n] ? ctx.panel.unit(n) : null
      let src = `${symOf(vars, n)} = ${valueTex(n, br.values[n], vars, siId(spec.dim))}`
      const si = siId(spec.dim)
      if (unit && unit !== si && spec.dim && spec.dim !== 'count') src += `\\;=\\;${valueTex(n, br.values[n], vars, unit)}`
      res.append(h('div', { class: `mxResult${asked.has(n) ? ' is-asked' : ''}`, 'data-tex': src }))
    }
    if (res.childNodes.length) {
      el.append(h('h4', { class: 'mxSolTitle' }, t('common.steps.summary', 'Results')), res)
    }
  }
  ctx.afterBranch?.(el, br, bi)
}

function failReason(fail, vars) {
  const iso = fail.iso
  if (fail.system) return fill(t('common.steps.outOfDomain', 'the value {v} lies outside its physical range'), { v: texNum(fail.value) })
  if (!iso) return ''
  if (iso.method === 'noReal' || (iso.method === 'quadratic' && iso.disc < 0)) return t('common.steps.negativeRoot', 'it would require the square root of a negative number')
  if (iso.rejected?.length) {
    return fill(t('common.steps.onlyRejected', 'the only candidates, {list}, lie outside its physical range'), {
      list: iso.rejected.map(r => `\\(${texNum(displayVal(r, vars[fail.unknown]))}\\)`).join(', '),
    })
  }
  return t('common.steps.noRoot', 'the equation has no root in its physical range')
}

const displayVal = (v, spec) => (spec?.dim === 'angle' ? v * 180 / Math.PI : v)

function stepCard(s, i, ctx) {
  const { system } = ctx
  const vars = system.vars
  const card = h('article', { class: 'mxStep' })
  const num = h('span', { class: 'mxStepNum' }, String(i + 1))
  if (s.type === 'system') {
    card.append(h('header', { class: 'mxStepHead' }, num,
      h('span', { class: 'mxProse mxStepTitle', html: fill(t('common.steps.solveSystem', 'Solve the system for {list}'), { list: listSyms(vars, s.unknowns) }) })))
    card.append(prose(fill(t('common.steps.systemWhy', 'No single equation contains just one unknown, but equations {eqs} share exactly the {n} unknowns {list}: {n} equations for {n} unknowns, a system we can solve.'), {
      eqs: s.eqIds.map(id => proseLabel(system, id)).join(', '),
      n: s.unknowns.length,
      list: listSyms(vars, s.unknowns),
    })))
    for (const e of s.eqs) card.append(disp(`${eqLabel(system, e.id)}\\quad ${eqTex(e, vars)}`))
    card.append(prose(t('common.steps.substituteKnown', 'Substituting the known values and ordering each equation:')))
    for (const r of s.rows) card.append(disp(`${eqLabel(system, r.eqId)}\\quad ${rowTex(r.coef, r.rhs, vars)}`))
    for (const entry of s.log) {
      if (entry.type === 'express') {
        card.append(prose(fill(t('common.steps.express', 'From {eq} we isolate {u}:'), { eq: proseLabel(system, entry.eqId), u: `\\(${symOf(vars, entry.u)}\\)` })))
        card.append(disp(exprTex(entry.expr, vars)))
      } else {
        card.append(prose(fill(t('common.steps.substituteInto', 'Substituting into {eq}:'), { eq: proseLabel(system, entry.eqId) })))
        card.append(disp(rowTex(entry.row.coef, entry.row.rhs, vars)))
      }
    }
    const box = h('div', { class: 'mxBoxed' })
    for (const u of s.unknowns) box.append(h('div', { 'data-tex': `${symOf(vars, u)} = ${valueTex(u, s.sol[u], vars, siId(vars[u]?.dim))}` }))
    card.append(box)
    if (ctx.signNote) { const note = ctx.signNote(s); if (note) card.append(prose(note)) }
    return card
  }

  const u = s.unknown
  const e = s.eq
  const iso = s.iso
  card.append(h('header', { class: 'mxStepHead' }, num,
    h('span', { class: 'mxProse mxStepTitle', html: fill(t('common.steps.find', 'Find {u}'), { u: `\\(${symOf(vars, u)}\\)` }) })))
  card.append(prose(whyText(s, ctx)))
  card.append(disp(`${eqLabel(system, e.id)}\\quad ${eqTex(e, vars)}`))

  if (iso.method === 'quadratic') {
    card.append(prose(fill(t('common.steps.quadratic', '{u} appears both squared and to the first power, so we gather every term on one side and get a quadratic equation:'), { u: `\\(${iso.head}\\)` })))
    card.append(disp(iso.sym))
    card.append(prose(t('common.steps.quadraticNum', 'With the numbers, its coefficients are')))
    card.append(disp(iso.num))
    card.append(disp(iso.formula))
    const rootsList = iso.base.map(x => texNum(x)).join(',\\quad ')
    card.append(disp(`${iso.head} = ${rootsList || '\\varnothing'}`))
    if (iso.fn) card.append(prose(fill(t('common.steps.inverseEach', 'Each root gives an angle through the inverse function of {fn}.'), { fn: `\\(\\${iso.fn}\\)` })))
  } else if (iso.method === 'numeric') {
    card.append(prose(fill(t('common.steps.numeric', 'The unknown {u} appears inside different functions, so we solve the equation numerically:'), { u: `\\(${symOf(vars, u)}\\)` })))
    card.append(disp(iso.sym))
  } else {
    const key = iso.method === 'linear' ? 'common.steps.isolate' : iso.method === 'inverse' ? 'common.steps.isolateFn' : 'common.steps.isolatePow'
    card.append(prose(fill(t(key, 'Isolating {u}:'), { u: `\\(${iso.head}\\)` })))
    card.append(disp(iso.sym))
    card.append(prose(t('common.steps.substitute', 'Substituting the values (in SI units):')))
    card.append(disp(iso.num))
    if (iso.method === 'root') {
      card.append(prose(fill(t('common.steps.takeRoot', 'Taking the root, {u} can be {list}.'), {
        u: `\\(${symOf(vars, u)}\\)`,
        list: rootsOf(iso, vars[u]).map(x => `\\(${texNum(x)}\\)`).join(` ${t('common.steps.or', 'or')} `),
      })))
    }
    if (iso.method === 'inverse') {
      card.append(prose(fill(t('common.steps.applyInverse', 'Applying the inverse function, {u} = {list}.'), {
        u: `\\(${symOf(vars, u)}\\)`,
        list: rootsOf(iso, vars[u]).map(x => `\\(${texNum(x)}${vars[u]?.dim === 'angle' ? '^\\circ' : ''}\\)`).join(` ${t('common.steps.or', 'or')} `),
      })))
    }
  }

  if (iso.rejected?.length && Number.isFinite(s.value)) {
    card.append(prose(fill(t('common.steps.discard', 'We discard {list}: {why}'), {
      list: iso.rejected.map(r => `\\(${symOf(vars, u)} = ${texNum(displayVal(r, vars[u]))}${vars[u]?.dim === 'angle' ? '^\\circ' : ''}\\)`).join(', '),
      why: t(vars[u]?.reject ?? 'common.steps.rejectDefault', 'it lies outside the physical range of the quantity.'),
    })))
  }
  if (s.of > 1) {
    card.append(prose(fill(t('common.steps.branch', 'Both values are physically possible; this solution follows {u} = {v}.'), {
      u: `\\(${symOf(vars, u)}\\)`,
      v: `\\(${valueTex(u, s.value, vars, siId(vars[u]?.dim))}\\)`,
    })))
  }
  if (Number.isFinite(s.value)) {
    card.append(h('div', { class: 'mxBoxed', 'data-tex': `${symOf(vars, u)} = ${valueTex(u, s.value, vars, siId(vars[u]?.dim))}` }))
    const note = ctx.valueNote?.(u, s.value)
    if (note) card.append(prose(note))
  }
  return card
}

function rootsOf(iso, spec) {
  return [...iso.roots, ...(iso.rejected ?? [])].map(x => displayVal(x, spec))
}

function whyText(s, ctx) {
  const { system } = ctx
  const vars = system.vars
  const e = s.eq
  const u = s.unknown
  if (ctx.why) {
    const custom = ctx.why(s)
    if (custom) return custom
  }
  if (e.lacks && !s.known.has(e.lacks)) {
    return fill(t('common.steps.whyLacks', 'We use {eq} because it is the equation of the invariant that contains {u} but not {lacks}, which we do not know yet; its other quantities, {inputs}, are already known.'), {
      eq: proseLabel(system, e.id),
      u: `\\(${symOf(vars, u)}\\)`,
      lacks: `\\(${symOf(vars, e.lacks)}\\)`,
      inputs: listSyms(vars, s.inputs),
    })
  }
  if (!s.inputs.length) {
    return fill(t('common.steps.whyAlone', 'Equation {eq} contains only {u}.'), { eq: proseLabel(system, e.id), u: `\\(${symOf(vars, u)}\\)` })
  }
  return fill(t('common.steps.why', 'We use {eq} because {u} is its only unknown: {inputs} are already known.'), {
    eq: proseLabel(system, e.id),
    u: `\\(${symOf(vars, u)}\\)`,
    inputs: listSyms(vars, s.inputs),
  })
}

export { mathify }
