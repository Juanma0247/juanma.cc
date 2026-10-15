// Engine of the dynamics pages (Newton's laws and friction). A page offers a
// catalogue of physical setups (an incline, an Atwood machine, a conical
// pendulum…). Each setup declares its quantities, the component equations of
// Newton's second law for every body (written for the current regime and
// direction of motion), its free-body diagrams and its drawing; this module
// turns that into a topic for TopicPage.

import { t, fill, h, tex, texNum } from './core.js'
import { eq } from './algebra.js'
import { renderFbd } from './fbd.js'
import { readout } from './draw.js'

const KIN_VARS = {
  kt: { tex: 't', dim: 'time', name: 'time', range: [0, Infinity], nonzero: true, optional: true, reject: 'common.steps.rejectTime' },
  kd: { tex: 'd', dim: 'length', name: 'distance', optional: true },
  kv: { tex: 'v_f', dim: 'velocity', name: 'finalVelocity', optional: true },
}

const KIN_EQS = [
  eq('k1', 'kv = a*kt', { label: '(K_1)', note: 'whyKin' }),
  eq('k2', 'kd = 1/2*a*kt^2', { label: '(K_2)', note: 'whyKin' }),
]

export const G = { tex: 'g', dim: 'acceleration', name: 'gravity' }

// Shared variable specs.
export const V = {
  mass: (tex, name = 'mass') => ({ tex, dim: 'mass', name, range: [0, Infinity], nonzero: true, reject: 'common.steps.rejectMass' }),
  force: (tex, name, optional = false) => ({ tex, dim: 'force', name, range: [0, Infinity], reject: 'common.steps.rejectForce', optional }),
  angle: (tex, name, lo = -90, hi = 90) => ({ tex, dim: 'angle', name, unit: 'deg', range: [lo * Math.PI / 180, hi * Math.PI / 180], reject: 'common.steps.rejectAngle' }),
  accel: { tex: 'a', dim: 'acceleration', name: 'acceleration' },
  mu: (tex, name) => ({ tex, dim: 'none', name, range: [0, Infinity] }),
}

export function makeDynamicsTopic({ key, setups, friction = false }) {
  const tk = (k, f) => t(`${key}.${k}`, t(`common.dyn.${k}`, f ?? ''))
  const state = { setup: setups[0].id, regime: 'auto', dir: null, auto: null }
  const setup = () => setups.find(s => s.id === state.setup) ?? setups[0]
  const ctxOf = () => ({ regime: state.regime === 'auto' ? (state.auto?.regime ?? 'kinetic') : state.regime, dir: state.auto?.dir ?? state.dir ?? setup().dirs?.[0] ?? null })

  const regimeEqs = (S, ctx) => {
    if (!S.friction) return []
    const f = S.frictionVar ?? 'f'
    const n = S.normalVar ?? 'N'
    if (ctx.regime === 'kinetic') return [eq('fr', `${f} = mk*${n}`, { label: '(f)', note: 'whyKinetic' })]
    if (ctx.regime === 'impending') return [eq('fr', `${f} = ms*${n}`, { label: '(f)', note: 'whyImpending' }), eq('a0', 'a = 0', { label: '(a)', note: 'whyRest' })]
    return [eq('a0', 'a = 0', { label: '(a)', note: 'whyRest' })]
  }

  const presets = setups.flatMap(S => (S.presets ?? []).map(p => ({ ...p, options: { setup: S.id, regime: 'auto', ...(p.options ?? {}) } })))

  const topic = {
    key,
    usesG: true,
    controlsFirst: true,
    presets,
    options: { setup: setups[0].id, regime: 'auto', dir: null },
    conditions: friction ? null : [
      { id: 'free' },
      { id: 'equilibrium', lock: { a: 0 }, when: () => 'a' in setup().vars && setup().moving !== false },
    ],

    order() {
      const S = setup()
      return [...S.order, ...(S.moving && S.kinematics !== false ? ['kt', 'kd', 'kv'] : [])]
    },

    system(page) {
      const S = setup()
      if (state.regime === 'auto' && S.friction && S.auto && page?.panel) {
        state.auto = S.auto({ ...page.panel.given(), g: page.g })
      } else if (state.regime !== 'auto' || !S.friction) state.auto = null
      const ctx = ctxOf()
      const vars = { ...S.vars, g: G, ...(S.moving && S.kinematics !== false ? KIN_VARS : {}) }
      const eqs = [...S.eqs(ctx), ...regimeEqs(S, ctx), ...(S.moving && S.kinematics !== false ? KIN_EQS : [])]
      return { vars, eqs }
    },

    fixed(page) {
      return { g: page.g }
    },

    syncOptions(page) {
      const prev = state.setup
      state.setup = page.options.setup ?? setups[0].id
      state.regime = page.options.regime ?? 'auto'
      state.dir = page.options.dir ?? setup().dirs?.[0] ?? null
      if (prev !== state.setup && page.panel) page.rebuildPanel()
      topic.syncControls(page)
    },

    extraControls(box, page) {
      const sel = h('select', { class: 'mxPresetSel', 'aria-label': 'setup' })
      page.setupSel = sel
      const groups = [...new Set(setups.map(s => s.group))]
      const fillSel = () => {
        sel.innerHTML = ''
        for (const g of groups) {
          const og = h('optgroup', { label: tk(`groups.${g}`, g) })
          for (const S of setups.filter(s => s.group === g)) og.append(h('option', { value: S.id }, tk(`setups.${S.id}.title`, S.id)))
          sel.append(og)
        }
        sel.value = state.setup
      }
      fillSel()
      page.fillSetupSel = fillSel
      sel.addEventListener('change', () => {
        page.options = { ...page.options, setup: sel.value, dir: null }
        state.setup = sel.value
        state.dir = setup().dirs?.[0] ?? null
        page.presetSel.value = ''
        page.statement.hidden = true
        page.rebuildPanel()
        topic.syncControls(page)
        page.setCondition(page.topic.conditions?.[0]?.id ?? null)
      })
      page.setupDesc = h('p', { class: 'mxHint' })
      page.regimeBox = h('div', { class: 'mxBlock' })
      page.dirBox = h('div', { class: 'mxBlock' })
      box.append(h('h3', { class: 'mxH3', 'data-mx': 'setupTitle' }, tk('setupTitle', 'Physical system')), sel, page.setupDesc, page.regimeBox, page.dirBox)
      topic.syncControls(page)
    },

    syncControls(page) {
      if (!page.setupSel) return
      const S = setup()
      page.setupSel.value = state.setup
      page.setupDesc.innerHTML = tk(`setups.${S.id}.desc`, '')
      page.regimeBox.innerHTML = ''
      page.dirBox.innerHTML = ''
      if (S.friction) {
        const seg = h('div', { class: 'mxConditions' })
        for (const r of ['auto', 'static', 'impending', 'kinetic']) {
          const b = h('button', { class: `mxCond${state.regime === r ? ' is-active' : ''}`, type: 'button' }, tk(`regimes.${r}`, r))
          b.addEventListener('click', () => { state.regime = r; page.options.regime = r; topic.syncControls(page); page.update() })
          seg.append(b)
        }
        page.regimeBox.append(h('h3', { class: 'mxH3' }, tk('regimeTitle', 'Regime')), seg, h('p', { class: 'mxHint', html: tk(`regimeHints.${state.regime}`, '') }))
      }
      if (S.dirs && !(S.friction && state.regime === 'auto')) {
        const seg = h('div', { class: 'mxConditions' })
        for (const d of S.dirs) {
          const b = h('button', { class: `mxCond${(state.dir ?? S.dirs[0]) === d ? ' is-active' : ''}`, type: 'button' }, tk(`dirs.${d}`, d))
          b.addEventListener('click', () => { state.dir = d; page.options.dir = d; topic.syncControls(page); page.update() })
          seg.append(b)
        }
        page.dirBox.append(h('h3', { class: 'mxH3' }, tk(S.dirTitle ?? 'dirTitle', 'Assumed direction of motion')), seg)
      }
      page.renderConditions?.()
    },

    retranslate(page) {
      page.fillSetupSel?.()
      const title = document.querySelector('[data-mx="setupTitle"]')
      if (title) title.textContent = tk('setupTitle', 'Physical system')
      topic.syncControls(page)
    },

    why(s) {
      const note = s.eq.note
      if (!note) return null
      const txt = tk(`notes.${note}`, '')
      return txt ? fill(txt, { u: `\\(${s.eq && setupVarsTex(s.unknown)}\\)` }) : null
    },

    variant(vals, page) {
      const S = setup()
      const card = S.course?.(vals, page.g, ctxOf())
      if (!card) return null
      return {
        title: tk('courseTitle', 'The invariant of the course for this system'),
        tag: tk('courseTag', 'F_mayor − F_menor = m a'),
        eqs: card.eqs,
        note: card.note ?? tk('courseNote', 'Taking as positive the direction in which the system moves, the forces that drive it minus those that oppose it equal the total mass times the acceleration; the tensions inside the system cancel in pairs.'),
      }
    },

    invariantExtra(vals) {
      const out = []
      if (state.auto?.explain) {
        out.push(h('div', { class: 'mxInvCard' },
          h('h3', { class: 'mxInvCardTitle' }, h('span', {}, tk('autoTitle', 'Does it move? First classification'))),
          h('p', { class: 'mxInvNote mxProse', html: state.auto.explain })))
      }
      return out
    },

    motion(vals, page) {
      const S = setup()
      const a = Number.isFinite(vals.a) ? vals.a : 0
      const anim = S.anim?.(vals, page.g, ctxOf()) ?? null
      const T = anim?.duration ?? (S.moving ? 3 : 4)
      return {
        a, vals, g: page.g, duration: T, moving: S.moving && Number.isFinite(vals.a), anim,
        s: tt => 0.5 * a * tt * tt,
        v: tt => a * tt,
      }
    },

    plots(m) {
      if (!m.moving) return []
      return [
        {
          id: 'x', title: tk('plotS', 'Displacement along the motion \\(s(t)\\)'),
          note: tk('plotSNote', 'From rest with the acceleration found: s = ½ a t².'),
          cfg: { xLabel: 't (s)', yLabel: 's (m)', yUnit: 'm', series: [{ fn: m.s, color: 'primary' }] },
        },
        {
          id: 'v', title: tk('plotV', 'Speed \\(v(t)\\)'),
          note: tk('plotVNote', 'A straight line whose slope is the acceleration given by ΣF = ma.'),
          cfg: { xLabel: 't (s)', yLabel: 'v (m/s)', yUnit: 'm/s', series: [{ fn: m.v, color: 'second' }], areas: [{ fn: m.v, from: 0, to: m.duration }] },
        },
      ]
    },

    events(m, page) {
      const S = setup()
      const out = []
      const checks = S.check?.(m.vals, page.g, ctxOf()) ?? []
      if (checks.length) {
        out.push({ title: tk('checkTitle', 'Verification: ΣF = m a body by body'), lines: checks })
      }
      const extra = S.extraEvents?.(m.vals, page.g, ctxOf(), tk) ?? []
      out.push(...extra)
      return out
    },

    legend() {
      return [
        { color: 'primary', label: tk('legendBodies', 'bodies') },
        { color: 'second', label: tk('legendForces', 'applied forces and tensions') },
        { color: 'third', label: tex('\\vec a') + ' ' + tk('legendAccel', 'acceleration') },
      ]
    },

    draw(ctx, w, hh, m, time, c) {
      const S = setup()
      S.scene(ctx, w, hh, m.vals, m, time, c, ctxOf())
      if (m.moving) readout(ctx, c, [['t', time, 's'], ['s', m.s(time), 'm'], ['v', m.v(time), 'm/s']])
    },

    afterUpdate(vals, page) {
      const box = document.getElementById('mxFbd')
      if (!box) return
      const S = setup()
      renderFbd(box, S.bodies(vals, page.g, ctxOf(), tk), page.c)
    },
  }

  let currentVars = {}
  const setupVarsTex = u => currentVars[u]?.tex ?? u
  const sys0 = topic.system
  topic.system = page => { const s = sys0(page); currentVars = s.vars; return s }
  return topic
}

// Helpers for setups.
export const deg = x => x * Math.PI / 180
export const val = (v, k, fb = NaN) => (Number.isFinite(v[k]) ? v[k] : fb)
export const fmtN = x => (Number.isFinite(x) ? `${texNum(x)}\\,\\text{N}` : '?')

// Verification line: Σ forces (with values) = m a.
export function checkLine(label, terms, m, a) {
  const sum = terms.reduce((acc, [s, x]) => acc + s * x, 0)
  const parts = terms.map(([s, x], i) => `${i === 0 ? (s < 0 ? '-' : '') : (s < 0 ? ' - ' : ' + ')}${texNum(Math.abs(x))}`).join('')
  return `${label}:\\; ${parts} = ${texNum(sum)}\\,\\text{N} \\;\\approx\\; m a = ${texNum(m * a)}\\,\\text{N}`
}
