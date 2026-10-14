// "Datos del problema": one row per quantity of the model. A filled row is a
// datum of the statement, an empty one is an unknown the solver will try to
// find (its value then appears as the placeholder). Rows can be locked by a
// condition of the statement, such as v = 0 at the maximum height.

import { h, t, tex, unitsOf, unitOf, unitTex, toSI, fromSI, fmt, parseNumber, debounce, Gravity } from './core.js'

export class DataPanel {
  constructor(container, { vars, order, onChange, asked = true }) {
    this.vars = vars
    this.order = order
    this.onChange = onChange
    this.rows = {}
    this.locks = {}
    this.asked = new Set()
    this.el = h('div', { class: 'mxRows' })
    container.append(this.el)
    const fire = debounce(() => this.onChange(), 160)
    for (const name of order) {
      const spec = vars[name]
      const input = h('input', {
        class: 'mxIn', type: 'text', inputmode: 'decimal', spellcheck: 'false', autocomplete: 'off',
        placeholder: '?', 'aria-label': name,
      })
      const units = unitsOf(spec.dim)
      const unitSel = h('select', { class: 'mxUnit', 'aria-label': 'unit', hidden: units.length < 2 || spec.dim === 'count' || spec.dim === 'none' },
        ...units.map(u => h('option', { value: u.id, selected: u.id === (spec.unit ?? units[0].id) }, unitLabel(spec.dim, u.id))))
      const unitStatic = h('span', { class: 'mxUnitStatic', hidden: !(units.length < 2 || spec.dim === 'count' || spec.dim === 'none') },
        spec.dim === 'count' ? '' : (units[0].id || ''))
      const star = asked ? h('button', { class: 'mxStar', type: 'button', title: t('common.panel.askedTip', 'Mark as asked'), 'aria-pressed': 'false' }, '★') : null
      const name_ = h('span', { class: 'mxName', 'data-key': spec.name })
      const sym = h('span', { class: 'mxSym', html: tex(spec.tex) })
      const row = h('div', { class: 'mxRow is-unknown', dataset: { var: name } },
        sym,
        h('label', { class: 'mxField' }, name_, input),
        h('div', { class: 'mxUnitCell' }, unitSel, unitStatic),
        star)
      this.el.append(row)
      this.rows[name] = { row, input, unitSel, star, name_ }
      input.addEventListener('input', () => { this.refreshState(name); fire() })
      unitSel.addEventListener('change', () => { this.refreshState(name); this.onChange() })
      if (star) {
        star.addEventListener('click', () => {
          if (this.asked.has(name)) this.asked.delete(name)
          else this.asked.add(name)
          star.setAttribute('aria-pressed', String(this.asked.has(name)))
          row.classList.toggle('is-asked', this.asked.has(name))
          this.onChange()
        })
      }
    }
    this.translate()
  }

  translate() {
    for (const name of this.order) {
      const r = this.rows[name]
      const spec = this.vars[name]
      r.name_.textContent = t(`common.vars.${spec.name}`, spec.name)
      if (spec.hint) r.name_.title = t(spec.hint, '')
      if (r.star) r.star.title = t('common.panel.askedTip', 'Mark as asked')
      if (spec.dim === 'count') r.row.querySelector('.mxUnitStatic').textContent = t('common.units.turns', 'turns')
    }
  }

  unit(name) {
    const r = this.rows[name]
    return r ? r.unitSel.value || unitsOf(this.vars[name].dim)[0].id : unitsOf(this.vars[name]?.dim)[0].id
  }

  refreshState(name) {
    const r = this.rows[name]
    const p = parseNumber(r.input.value)
    r.row.classList.toggle('is-invalid', !p.ok)
    r.row.classList.toggle('is-given', p.ok && !p.empty)
    r.row.classList.toggle('is-unknown', p.empty)
  }

  // Values typed by the reader, converted to SI.
  given() {
    const out = {}
    const raw = {}
    for (const name of this.order) {
      if (this.locks[name]) { out[name] = this.locks[name].value; continue }
      const r = this.rows[name]
      const p = parseNumber(r.input.value)
      if (p.ok && !p.empty) {
        const spec = this.vars[name]
        let v = toSI(p.value, spec.dim, this.unit(name))
        if (spec.signFrom) v *= spec.signFrom()
        out[name] = v
        raw[name] = { value: p.value, unit: this.unit(name) }
      }
    }
    this.raw = raw
    return out
  }

  // Condition of the statement: the row shows the value and cannot be edited.
  lock(name, value, reasonKey) {
    const r = this.rows[name]
    if (!r) return
    this.locks[name] = { value, reasonKey }
    r.input.disabled = true
    r.input.value = fmt(fromSI(value, this.vars[name].dim, this.unit(name)))
    r.row.classList.add('is-locked')
    r.row.classList.remove('is-unknown')
    r.row.title = t(reasonKey, '')
  }

  unlockAll() {
    for (const name of Object.keys(this.locks)) {
      const r = this.rows[name]
      r.input.disabled = false
      r.input.value = ''
      r.row.classList.remove('is-locked')
      r.row.title = ''
      this.refreshState(name)
    }
    this.locks = {}
  }

  clear() {
    this.unlockAll()
    for (const name of this.order) {
      const r = this.rows[name]
      r.input.value = ''
      r.unitSel.value = this.vars[name].unit ?? unitsOf(this.vars[name].dim)[0].id
      this.refreshState(name)
    }
    this.asked.clear()
    for (const name of this.order) {
      const r = this.rows[name]
      r.row.classList.remove('is-asked')
      r.star?.setAttribute('aria-pressed', 'false')
    }
  }

  // data: { name: [value, unitId] }
  load(data, asked = []) {
    this.clear()
    for (const [name, [value, unit]] of Object.entries(data)) {
      const r = this.rows[name]
      if (!r) continue
      if (unit) r.unitSel.value = unit
      r.input.value = String(value)
      this.refreshState(name)
    }
    for (const name of asked) {
      const r = this.rows[name]
      if (!r) continue
      this.asked.add(name)
      r.row.classList.add('is-asked')
      r.star?.setAttribute('aria-pressed', 'true')
    }
  }

  // Unknown rows show the solved value in their own unit.
  showSolution(values) {
    for (const name of this.order) {
      const r = this.rows[name]
      if (this.locks[name]) continue
      const p = parseNumber(r.input.value)
      if (!p.empty) { r.row.classList.remove('is-solved'); continue }
      const v = values?.[name]
      const spec = this.vars[name]
      if (Number.isFinite(v)) {
        let shown = v
        if (spec.signFrom) shown *= spec.signFrom()
        r.input.placeholder = `= ${fmt(fromSI(shown, spec.dim, this.unit(name)))}`
        r.row.classList.add('is-solved')
      } else {
        r.input.placeholder = '?'
        r.row.classList.remove('is-solved')
      }
    }
  }
}

function unitLabel(dim, id) {
  const u = unitOf(dim, id)
  return u.id
    .replace('m/s2', 'm/s²').replace('cm/s2', 'cm/s²').replace('ft/s2', 'ft/s²').replace('km/h2', 'km/h²')
    .replace('rad/s2', 'rad/s²').replace('rev/s2', 'rev/s²').replace('deg/s', '°/s').replace(/^deg$/, '°')
}

// g selector shared by every page (9.8 by default, as in the course notes).
export function gravityControl(container, onChange) {
  const presets = ['9.8', '9.81', '10']
  const sel = h('select', { class: 'mxGSel', 'aria-label': 'g' },
    ...presets.map(v => h('option', { value: v }, `${v} m/s²`)),
    h('option', { value: 'custom', 'data-i18n-opt': 'custom' }, t('common.panel.gCustom', 'Other…')))
  const custom = h('input', { class: 'mxIn mxGCustom', type: 'text', inputmode: 'decimal', hidden: true, 'aria-label': 'g' })
  const g = Gravity.get()
  if (presets.includes(String(g))) sel.value = String(g)
  else { sel.value = 'custom'; custom.hidden = false; custom.value = String(g) }
  const wrap = h('div', { class: 'mxGRow' },
    h('span', { class: 'mxSym', html: tex('g') }),
    h('span', { class: 'mxGName' }, t('common.vars.gravity', 'Free-fall acceleration')),
    sel, custom)
  container.append(wrap)
  const apply = () => {
    let v = sel.value === 'custom' ? parseNumber(custom.value).value : Number(sel.value)
    if (!(v > 0)) return
    Gravity.set(v)
    onChange(v)
  }
  sel.addEventListener('change', () => { custom.hidden = sel.value !== 'custom'; if (sel.value !== 'custom') apply() })
  custom.addEventListener('input', debounce(apply, 200))
  return {
    translate() {
      wrap.querySelector('.mxGName').textContent = t('common.vars.gravity', 'Free-fall acceleration')
      sel.querySelector('[value="custom"]').textContent = t('common.panel.gCustom', 'Other…')
    },
  }
}

export { unitLabel, unitTex }
