// Friction: the same engine as Newton's laws, with a regime to choose. In the
// automatic regime the page first asks the question of the course notes
// ("does it move, or does it stay at rest?") by comparing the force that tends
// to move the system with the maximum static friction, and only then writes the
// equations: a = 0 and f unknown if it holds, f = μₖN if it slides.

import { t, fill, texNum } from '../core.js'
import { eq } from '../algebra.js'
import { TopicPage } from '../topicPage.js'
import { makeDynamicsTopic, V, val, checkLine } from '../dynamics.js'
import { progress, pullScene, inclineScene, tableHangScene, inclineHangScene, contactScene, brakingScene, topViewScene } from '../dynScenes.js'

const D = 180 / Math.PI
const n = x => (Number.isFinite(x) ? texNum(x) : '?')
const tk = (k, f) => t(`friction.${k}`, f)
const mu = (tex, name) => ({ tex, dim: 'none', name, range: [0, Infinity] })
const F = V.force

// Explanation of the automatic decision.
function decide(drive, maxStatic, symDrive, dirText = '') {
  if (!Number.isFinite(drive) || !Number.isFinite(maxStatic)) return null
  const holds = Math.abs(drive) <= maxStatic + 1e-9
  const explain = fill(tk(holds ? 'auto.holds' : 'auto.moves', ''), {
    drive: `\\(${symDrive} = ${texNum(Math.abs(drive))}\\,\\text{N}\\)`,
    max: `\\(\\mu_s N = ${texNum(maxStatic)}\\,\\text{N}\\)`,
    dir: dirText,
  })
  return { regime: holds ? 'static' : 'kinetic', explain }
}

const fpull = {
  id: 'fpull', group: 'blocks', moving: true, friction: true,
  vars: { m: V.mass('m'), F: F('F', 'force'), th: V.angle('\\theta', 'forceAngle'), N: F('N', 'normal'), f: F('f', 'friction'), ms: mu('\\mu_s', 'muS'), mk: mu('\\mu_k', 'muK'), a: V.accel },
  order: ['m', 'F', 'th', 'N', 'f', 'ms', 'mk', 'a'],
  eqs: () => [
    eq('n1', 'F*cos(th) - f = m*a', { label: '(x)', note: 'fx' }),
    eq('n2', 'N + F*sin(th) - m*g = 0', { label: '(y)', note: 'fy' }),
  ],
  auto: v => {
    const N = v.m * v.g - v.F * Math.sin(v.th ?? 0)
    return decide(v.F * Math.cos(v.th ?? 0), v.ms * N, 'F\\cos\\theta')
  },
  bodies: (v, g, ctx, tk2) => [{
    title: tk2('bodies.block', 'Block'), axis: 0,
    forces: [
      { label: 'mg', angle: 270, value: val(v, 'm') * g, color: 'muted' },
      { label: 'N', angle: 90, value: val(v, 'N'), color: 'primary' },
      { label: 'F', angle: val(v, 'th', 0) * D, value: val(v, 'F'), color: 'second', components: Math.abs(val(v, 'th', 0)) > 1e-6, compLabels: ['F\\cos\\theta', 'F\\sin\\theta'] },
      { label: 'f', angle: 180, value: val(v, 'f'), color: 'third' },
    ],
    accel: { angle: 0, value: val(v, 'a') },
    eqs: ['F\\cos\\theta - f = m\\,a', 'N + F\\sin\\theta - mg = 0'],
  }],
  course: v => ({ eqs: ['F\\cos\\theta - f = m\\,a', `${n(v.F * Math.cos(v.th))} - ${n(v.f)} = (${n(v.m)})\\,a`] }),
  check: v => [checkLine('\\Sigma F_x', [[1, v.F * Math.cos(v.th)], [-1, v.f]], v.m, v.a)],
  extraEvents: (v, g, ctx) => staticCheck(v, ctx),
  scene: (ctx, w, h, v, m, time, c) => pullScene(ctx, w, h, c, { p: progress(m, time), th: val(v, 'th', 0), friction: true }),
  presets: [
    { id: 'minPush', data: { m: [20, 'kg'], th: [-30, 'deg'], ms: [0.4, ''] }, options: { regime: 'impending' }, asked: ['F'] },
    { id: 'sledK', data: { m: [7.5, 'kg'], F: [21, 'N'], th: [15, 'deg'], mk: [0.1, ''] }, options: { regime: 'kinetic' }, asked: ['a', 'N'] },
    { id: 'willMove', data: { m: [20, 'kg'], F: [50, 'N'], th: [0, 'deg'], ms: [0.3, ''], mk: [0.2, ''] }, asked: ['f', 'a'] },
    { id: 'moves', data: { m: [20, 'kg'], F: [80, 'N'], th: [0, 'deg'], ms: [0.3, ''], mk: [0.2, ''] }, asked: ['a'] },
  ],
}

function staticCheck(v, ctx) {
  if (ctx.regime !== 'static' || !Number.isFinite(v.f)) return []
  const lines = [`f = ${n(v.f)}\\,\\text{N}`]
  if (Number.isFinite(v.ms) && Number.isFinite(v.N)) {
    const max = v.ms * v.N
    lines.push(`\\mu_s N = (${n(v.ms)})(${n(v.N)}) = ${n(max)}\\,\\text{N}`)
    lines.push(v.f <= max + 1e-9 ? `f \\le \\mu_s N \\;\\checkmark` : `f > \\mu_s N \\;\\Rightarrow\\; \\text{${tk('slips', 'it would slip')}}`)
  }
  return [{ title: tk('staticTitle', 'Is static friction enough?'), lines }]
}

const fincline = {
  id: 'fincline', group: 'inclines', moving: true, friction: true, dirs: ['down', 'up'],
  vars: { m: V.mass('m'), th: V.angle('\\theta', 'inclineAngle', 0, 90), N: F('N', 'normal'), f: F('f', 'friction'), ms: mu('\\mu_s', 'muS'), mk: mu('\\mu_k', 'muK'), a: V.accel },
  order: ['m', 'th', 'N', 'f', 'ms', 'mk', 'a'],
  eqs: ctx => [
    ctx.dir === 'up'
      ? eq('n1', '-m*g*sin(th) - f = m*a', { label: '(x)', note: 'incUp' })
      : eq('n1', 'm*g*sin(th) - f = m*a', { label: '(x)', note: 'incDown' }),
    eq('n2', 'N - m*g*cos(th) = 0', { label: '(y)', note: 'incY' }),
  ],
  auto: v => {
    if (!Number.isFinite(v.th) || !Number.isFinite(v.ms)) return null
    const r = decide(Math.sin(v.th), v.ms * Math.cos(v.th), 'mg\\sin\\theta / mg')
    if (!r) return null
    r.dir = 'down'
    r.explain = fill(tk(r.regime === 'static' ? 'auto.inclineHolds' : 'auto.inclineSlides', ''), {
      tan: `\\(\\tan\\theta = ${texNum(Math.tan(v.th))}\\)`,
      ms: `\\(\\mu_s = ${texNum(v.ms)}\\)`,
    })
    return r
  },
  bodies: (v, g, ctx, tk2) => {
    const th = val(v, 'th', 0.5) * D
    const up = ctx.dir === 'up'
    return [{
      title: tk2('bodies.block', 'Block'), axis: up ? 180 - th : -th,
      forces: [
        { label: 'mg', angle: 270, value: val(v, 'm') * g, color: 'muted', components: true, compLabels: ['mg\\sin\\theta', 'mg\\cos\\theta'] },
        { label: 'N', angle: 90 - th, value: val(v, 'N'), color: 'primary' },
        { label: 'f', angle: up ? -th : 180 - th, value: val(v, 'f'), color: 'third' },
      ],
      accel: { angle: up ? 180 - th : -th, value: val(v, 'a') },
      eqs: [up ? '-mg\\sin\\theta - f = m\\,a' : 'mg\\sin\\theta - f = m\\,a', 'N - mg\\cos\\theta = 0'],
    }]
  },
  course: (v, g, ctx) => ({ eqs: [ctx.dir === 'up' ? '-(mg\\sin\\theta + \\mu_k mg\\cos\\theta) = m\\,a' : 'mg\\sin\\theta - f = m\\,a', ctx.regime === 'impending' ? '\\mu_s = \\tan\\theta' : 'a = g(\\sin\\theta - \\mu_k\\cos\\theta)'] }),
  check: (v, g, ctx) => [checkLine('\\Sigma F_x', [[ctx.dir === 'up' ? -1 : 1, v.m * g * Math.sin(v.th)], [-1, v.f]], v.m, v.a)],
  extraEvents: (v, g, ctx) => staticCheck(v, ctx),
  scene: (ctx, w, h, v, m, time, c) => inclineScene(ctx, w, h, c, { th: val(v, 'th', 0.5), p: progress(m, time), friction: true }),
  presets: [
    { id: 'critical', data: { m: [1, 'kg'], th: [15, 'deg'] }, options: { regime: 'impending' }, asked: ['ms'] },
    { id: 'slide', data: { m: [2, 'kg'], th: [30, 'deg'], mk: [0.2, ''] }, options: { regime: 'kinetic' }, asked: ['a'] },
    { id: 'stays', data: { m: [3, 'kg'], th: [20, 'deg'], ms: [0.5, ''], mk: [0.4, ''] }, asked: ['f'] },
    { id: 'shoved', data: { m: [2, 'kg'], th: [20, 'deg'], mk: [0.15, ''] }, options: { regime: 'kinetic', dir: 'up' }, asked: ['a'] },
    { id: 'findMuK', data: { m: [2, 'kg'], th: [30, 'deg'], a: [2.5, 'm/s2'] }, options: { regime: 'kinetic' }, asked: ['mk'] },
  ],
}

const ftable = {
  id: 'ftable', group: 'pulleys', moving: true, friction: true,
  vars: { m1: V.mass('m_1', 'mass1'), m2: V.mass('m_2', 'mass2'), T: F('T', 'tension'), N: F('N', 'normal'), f: F('f', 'friction'), ms: mu('\\mu_s', 'muS'), mk: mu('\\mu_k', 'muK'), a: V.accel },
  order: ['m1', 'm2', 'T', 'N', 'f', 'ms', 'mk', 'a'],
  eqs: () => [
    eq('n1', 'T - f = m1*a', { label: '(1x)', note: 'table1' }),
    eq('n2', 'N - m1*g = 0', { label: '(1y)', note: 'tableY' }),
    eq('n3', 'm2*g - T = m2*a', { label: '(2)', note: 'hanging' }),
  ],
  auto: v => decide(v.m2 * v.g, v.ms * v.m1 * v.g, 'm_2 g'),
  bodies: (v, g, ctx, tk2) => [
    { title: tk2('bodies.m1', 'Block 1'), axis: 0, forces: [{ label: 'N', angle: 90, value: val(v, 'N'), color: 'primary' }, { label: 'm_1 g', angle: 270, value: val(v, 'm1') * g, color: 'muted' }, { label: 'T', angle: 0, value: val(v, 'T'), color: 'second' }, { label: 'f', angle: 180, value: val(v, 'f'), color: 'third' }], accel: { angle: 0, value: val(v, 'a') }, eqs: ['T - f = m_1 a', 'N - m_1 g = 0'] },
    { title: tk2('bodies.m2', 'Block 2'), axis: 0, forces: [{ label: 'T', angle: 90, value: val(v, 'T'), color: 'second' }, { label: 'm_2 g', angle: 270, value: val(v, 'm2') * g, color: 'muted' }], accel: { angle: 270, value: val(v, 'a') }, eqs: ['m_2 g - T = m_2 a'] },
  ],
  course: v => ({ eqs: ['m_2 g - \\mu_k m_1 g = (m_1 + m_2)\\,a', `a = ${n(v.a)}\\,\\text{m/s}^2`] }),
  check: (v, g) => [checkLine('m_1', [[1, v.T], [-1, v.f]], v.m1, v.a), checkLine('m_2', [[1, v.m2 * g], [-1, v.T]], v.m2, v.a)],
  extraEvents: (v, g, ctx) => staticCheck(v, ctx),
  scene: (ctx, w, h, v, m, time, c) => tableHangScene(ctx, w, h, c, { p: progress(m, time), friction: true }),
  presets: [
    { id: 'tribometer', data: { m1: [6.2, 'kg'], m2: [8.5, 'kg'], mk: [0.2, ''] }, options: { regime: 'kinetic' }, asked: ['T', 'a'] },
    { id: 'tribometer10', data: { m1: [6.2, 'kg'], m2: [8.5, 'kg'], T: [46.38, 'N'] }, options: { regime: 'kinetic' }, asked: ['mk'] },
    { id: 'holds', data: { m1: [10, 'kg'], m2: [2, 'kg'], ms: [0.3, ''], mk: [0.2, ''] }, asked: ['f', 'T'] },
  ],
}

const fincHang = {
  id: 'fincHang', group: 'pulleys', moving: true, friction: true, dirs: ['m2down', 'm1down'],
  vars: { m1: V.mass('m_1', 'mass1'), m2: V.mass('m_2', 'mass2'), th: V.angle('\\theta', 'inclineAngle', 0, 90), T: F('T', 'tension'), N: F('N', 'normal'), f: F('f', 'friction'), ms: mu('\\mu_s', 'muS'), mk: mu('\\mu_k', 'muK'), a: V.accel },
  order: ['m1', 'm2', 'th', 'T', 'N', 'f', 'ms', 'mk', 'a'],
  eqs: ctx => (ctx.dir === 'm1down'
    ? [
      eq('n1', 'm1*g*sin(th) - T - f = m1*a', { label: '(1x)', note: 'fih1down' }),
      eq('n2', 'N - m1*g*cos(th) = 0', { label: '(1y)', note: 'incY' }),
      eq('n3', 'T - m2*g = m2*a', { label: '(2)', note: 'hangingUp' }),
    ]
    : [
      eq('n1', 'T - m1*g*sin(th) - f = m1*a', { label: '(1x)', note: 'fih1up' }),
      eq('n2', 'N - m1*g*cos(th) = 0', { label: '(1y)', note: 'incY' }),
      eq('n3', 'm2*g - T = m2*a', { label: '(2)', note: 'hanging' }),
    ]),
  auto: v => {
    const drive = v.m2 * v.g - v.m1 * v.g * Math.sin(v.th)
    const r = decide(drive, v.ms * v.m1 * v.g * Math.cos(v.th), '|m_2 g - m_1 g\\sin\\theta|', '')
    if (!r) return null
    r.dir = drive >= 0 ? 'm2down' : 'm1down'
    r.explain += ' ' + tk(drive >= 0 ? 'auto.towardM2' : 'auto.towardM1', '')
    return r
  },
  bodies: (v, g, ctx, tk2) => {
    const th = val(v, 'th', 0.5) * D
    const m1down = ctx.dir === 'm1down'
    return [
      { title: tk2('bodies.m1', 'Block 1'), axis: m1down ? 180 + th : th, forces: [{ label: 'm_1 g', angle: 270, value: val(v, 'm1') * g, color: 'muted', components: true, compLabels: ['m_1 g\\sin\\theta', 'm_1 g\\cos\\theta'] }, { label: 'N', angle: 90 + th, value: val(v, 'N'), color: 'primary' }, { label: 'T', angle: th, value: val(v, 'T'), color: 'second' }, { label: 'f', angle: m1down ? th : 180 + th, value: val(v, 'f'), color: 'third' }], accel: { angle: m1down ? 180 + th : th, value: val(v, 'a') } },
      { title: tk2('bodies.m2', 'Block 2'), axis: 0, forces: [{ label: 'T', angle: 90, value: val(v, 'T'), color: 'second' }, { label: 'm_2 g', angle: 270, value: val(v, 'm2') * g, color: 'muted' }], accel: { angle: m1down ? 90 : 270, value: val(v, 'a') } },
    ]
  },
  course: (v, g, ctx) => ({ eqs: [ctx.dir === 'm1down' ? 'm_1 g\\sin\\theta - m_2 g - f = (m_1 + m_2)\\,a' : 'm_2 g - m_1 g\\sin\\theta - f = (m_1 + m_2)\\,a', `a = ${n(v.a)}\\,\\text{m/s}^2`] }),
  check: (v, g, ctx) => ctx.dir === 'm1down'
    ? [checkLine('m_1', [[1, v.m1 * g * Math.sin(v.th)], [-1, v.T], [-1, v.f]], v.m1, v.a), checkLine('m_2', [[1, v.T], [-1, v.m2 * g]], v.m2, v.a)]
    : [checkLine('m_1', [[1, v.T], [-1, v.m1 * g * Math.sin(v.th)], [-1, v.f]], v.m1, v.a), checkLine('m_2', [[1, v.m2 * g], [-1, v.T]], v.m2, v.a)],
  extraEvents: (v, g, ctx) => staticCheck(v, ctx),
  scene: (ctx, w, h, v, m, time, c, dctx) => inclineHangScene(ctx, w, h, c, { th: val(v, 'th', 0.5), p: (dctx.dir === 'm1down' ? -1 : 1) * progress(m, time), friction: true }),
  presets: [{ id: 'resnick3', data: { m1: [9.5, 'kg'], m2: [2.6, 'kg'], th: [34, 'deg'], ms: [0.24, ''], mk: [0.15, ''] }, asked: ['a', 'T'] }],
}

const frope2 = {
  id: 'frope2', group: 'blocks', moving: true,
  vars: { F: F('F', 'force'), m1: V.mass('m_1', 'mass1'), m2: V.mass('m_2', 'mass2'), T: F('T', 'tension'), mk: mu('\\mu_k', 'muK'), N1: F('N_1', 'normal1'), N2: F('N_2', 'normal2'), f1: F('f_1', 'friction1'), f2: F('f_2', 'friction2'), a: V.accel },
  order: ['F', 'm1', 'm2', 'mk', 'T', 'a', 'f1', 'f2', 'N1', 'N2'],
  eqs: () => [
    eq('n1', 'T - f1 = m1*a', { label: '(1x)', note: 'rope1f' }),
    eq('n2', 'F - T - f2 = m2*a', { label: '(2x)', note: 'rope2f' }),
    eq('n3', 'N1 = m1*g', { label: '(1y)', note: 'tableY' }),
    eq('n4', 'N2 = m2*g', { label: '(2y)', note: 'tableY' }),
    eq('n5', 'f1 = mk*N1', { label: '(f_1)', note: 'whyKineticEq' }),
    eq('n6', 'f2 = mk*N2', { label: '(f_2)', note: 'whyKineticEq' }),
  ],
  bodies: (v, g, ctx, tk2) => [
    { title: tk2('bodies.m1', 'Block 1'), axis: 0, forces: [{ label: 'T', angle: 0, value: val(v, 'T'), color: 'second' }, { label: 'f_1', angle: 180, value: val(v, 'f1'), color: 'third' }, { label: 'N_1', angle: 90, value: val(v, 'N1'), color: 'primary' }, { label: 'm_1 g', angle: 270, value: val(v, 'm1') * g, color: 'muted' }], accel: { angle: 0, value: val(v, 'a') } },
    { title: tk2('bodies.m2', 'Block 2'), axis: 0, forces: [{ label: 'F', angle: 0, value: val(v, 'F'), color: 'second' }, { label: 'T', angle: 180, value: val(v, 'T'), color: 'second' }, { label: 'f_2', angle: 180, value: val(v, 'f2'), color: 'third' }, { label: 'N_2', angle: 90, value: val(v, 'N2'), color: 'primary' }, { label: 'm_2 g', angle: 270, value: val(v, 'm2') * g, color: 'muted' }], accel: { angle: 0, value: val(v, 'a') } },
  ],
  course: v => ({ eqs: ['F - \\mu_k (m_1 + m_2) g = (m_1 + m_2)\\,a', `a = ${n(v.a)}\\,\\text{m/s}^2`] }),
  check: v => [checkLine('m_1', [[1, v.T], [-1, v.f1]], v.m1, v.a), checkLine('m_2', [[1, v.F], [-1, v.T], [-1, v.f2]], v.m2, v.a)],
  scene: (ctx, w, h, v, m, time, c) => contactScene(ctx, w, h, c, { p: progress(m, time), rope: true, friction: true }),
  presets: [{ id: 'dragClass', data: { F: [68, 'N'], m1: [12, 'kg'], m2: [18, 'kg'], mk: [0.1, ''] }, asked: ['T', 'a'] }],
}

const braking = {
  id: 'braking', group: 'motion', moving: true, kinematics: false,
  vars: {
    mu: mu('\\mu', 'mu'), v0: { tex: 'v_0', dim: 'velocity', name: 'initialSpeed', range: [0, Infinity] },
    d: { tex: 'd', dim: 'length', name: 'distance', range: [0, Infinity] },
    kt: { tex: 't', dim: 'time', name: 'time', range: [0, Infinity], nonzero: true },
    a: { tex: 'a', dim: 'acceleration', name: 'acceleration', range: [0, Infinity] },
  },
  order: ['v0', 'mu', 'd', 'kt', 'a'],
  eqs: () => [
    eq('n1', 'a = mu*g', { label: '(F)', note: 'brakeForce' }),
    eq('n2', 'v0^2 = 2*a*d', { label: '(K)', note: 'brakeKin' }),
    eq('n3', 'v0 = a*kt', { label: '(t)', note: 'brakeTime' }),
  ],
  bodies: (v, g, ctx, tk2) => [{
    title: tk2('bodies.car', 'Car'), axis: 0,
    forces: [{ label: 'N', angle: 90, value: NaN, color: 'primary' }, { label: 'mg', angle: 270, value: NaN, color: 'muted' }, { label: 'f = \\mu N', angle: 180, value: NaN, color: 'third' }],
    accel: { angle: 180, value: val(v, 'a') },
    eqs: ['-f = -\\mu m g = m\\,a_x \\;\\Rightarrow\\; |a| = \\mu g'],
  }],
  course: () => ({ eqs: ['d = \\frac{v_0^2}{2\\mu g}'], note: '' }),
  anim: v => ({ duration: Number.isFinite(v.kt) ? v.kt : 3 }),
  scene: (ctx, w, h, v, m, time, c) => {
    const T = m.duration
    const p = Number.isFinite(v.v0) && Number.isFinite(v.a) && Number.isFinite(v.d) && v.d > 0 ? (v.v0 * Math.min(time, T) - 0.5 * v.a * Math.min(time, T) ** 2) / v.d : time / T
    brakingScene(ctx, w, h, c, { p })
  },
  presets: [
    { id: 'resnickStop', data: { v0: [27, 'm/s'], mu: [0.6, ''] }, asked: ['d', 'kt'] },
    { id: 'skidMarks', data: { v0: [72, 'km/h'], d: [30, 'm'] }, asked: ['mu'] },
  ],
}

const flatCurve = {
  id: 'flatCurve', group: 'circular', moving: false,
  vars: {
    mu: mu('\\mu_s', 'muS'), v: { tex: 'v', dim: 'velocity', name: 'speed', range: [0, Infinity] },
    r: { tex: 'r', dim: 'length', name: 'radius', range: [0, Infinity], nonzero: true },
    m: { ...V.mass('m'), optional: true }, f: { ...F('f', 'friction'), optional: true },
  },
  order: ['v', 'r', 'mu', 'm', 'f'],
  eqs: () => [
    eq('n1', 'v^2 = mu*g*r', { label: '(r)', note: 'curveMax' }),
    eq('n2', 'f = m*v^2/r', { label: '(f)', note: 'curveF' }),
  ],
  bodies: (v, g, ctx, tk2) => [{
    title: tk2('bodies.car', 'Car'), axis: 0,
    forces: [{ label: 'N', angle: 90, value: Number.isFinite(v.m) ? v.m * g : NaN, color: 'primary' }, { label: 'mg', angle: 270, value: Number.isFinite(v.m) ? v.m * g : NaN, color: 'muted' }, { label: 'f_s', angle: 180, value: val(v, 'f'), color: 'third' }],
    accel: { angle: 180, value: Number.isFinite(v.v) && Number.isFinite(v.r) ? v.v * v.v / v.r : NaN },
    eqs: ['f_s = m\\frac{v^2}{r} \\le \\mu_s m g'],
  }],
  course: () => ({ eqs: ['v_{\\text{máx}} = \\sqrt{\\mu_s g\\,r}'], note: '' }),
  anim: () => ({ duration: 6 }),
  scene: (ctx, w, h, v, m, time, c) => topViewScene(ctx, w, h, c, { time, kind: 'car' }),
  presets: [
    { id: 'serwayCurve', data: { r: [35, 'm'], mu: [0.523, ''], m: [1500, 'kg'] }, asked: ['v', 'f'] },
    { id: 'coin', data: { r: [30, 'cm'], v: [50, 'cm/s'] }, asked: ['mu'] },
  ],
}

const rotor = {
  id: 'rotor', group: 'circular', moving: false,
  vars: {
    mu: mu('\\mu_s', 'muS'), r: { tex: 'r', dim: 'length', name: 'radius', range: [0, Infinity], nonzero: true },
    v: { tex: 'v', dim: 'velocity', name: 'speed', range: [0, Infinity] },
    P: { tex: '\\tau', dim: 'time', name: 'period', range: [0, Infinity], nonzero: true },
  },
  order: ['r', 'mu', 'v', 'P'],
  eqs: () => [
    eq('n1', 'mu*v^2 = g*r', { label: '(z)', note: 'rotorEq', tex: '\\mu_s\\,\\frac{m v^2}{r} = m g' }),
    eq('n2', 'P*v = 2*pi*r', { label: '(\\tau)', note: 'periodDef', tex: '\\tau = \\frac{2\\pi r}{v}' }),
  ],
  bodies: (v, g, ctx, tk2) => [{
    title: tk2('bodies.person', 'Person'), axis: 0,
    forces: [{ label: 'f_s', angle: 90, value: NaN, color: 'third' }, { label: 'mg', angle: 270, value: NaN, color: 'muted' }, { label: 'N', angle: 180, value: NaN, color: 'primary' }],
    accel: { angle: 180, value: 1 },
    eqs: ['f_s - mg = 0', 'N = m\\frac{v^2}{r}', 'f_s \\le \\mu_s N'],
  }],
  course: () => ({ eqs: ['v_{\\text{mín}} = \\sqrt{\\frac{g\\,r}{\\mu_s}}'], note: '' }),
  anim: () => ({ duration: 6 }),
  scene: (ctx, w, h, v, m, time, c) => topViewScene(ctx, w, h, c, { time, kind: 'rotor' }),
  presets: [{ id: 'resnickRotor', data: { r: [2, 'm'], mu: [0.4, ''] }, asked: ['v', 'P'] }],
}

const topic = makeDynamicsTopic({
  key: 'friction',
  friction: true,
  setups: [fpull, fincline, ftable, fincHang, frope2, braking, flatCurve, rotor],
})

export default {
  main() {
    new TopicPage(topic).main()
  },
}
