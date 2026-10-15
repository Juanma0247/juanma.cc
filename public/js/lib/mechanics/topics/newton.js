// Newton's laws: a catalogue of frictionless setups, from a block pulled on a
// floor to the conical pendulum. Every setup writes ΣF = ma per body and per
// axis; the free-body diagrams and the course's invariant (driving forces
// minus opposing forces = total mass × a) are derived from the same data.

import { texNum } from '../core.js'
import { eq } from '../algebra.js'
import { TopicPage } from '../topicPage.js'
import { makeDynamicsTopic, V, val, checkLine } from '../dynamics.js'
import {
  progress, pullScene, inclineScene, atwoodScene, tableHangScene, inclineHangScene, contactScene,
  elevatorScene, knotScene, conicalScene, bankedScene, verticalCircleScene, topViewScene,
} from '../dynScenes.js'

const D = 180 / Math.PI
const W = (m, g) => m * g
const n = x => (Number.isFinite(x) ? texNum(x) : '?')

const pull = {
  id: 'pull', group: 'blocks', moving: true,
  vars: { m: V.mass('m'), F: V.force('F', 'force'), th: V.angle('\\theta', 'forceAngle'), N: V.force('N', 'normal'), a: V.accel },
  order: ['m', 'F', 'th', 'N', 'a'],
  eqs: () => [
    eq('n1', 'F*cos(th) = m*a', { label: '(x)', note: 'sumFx' }),
    eq('n2', 'N + F*sin(th) - m*g = 0', { label: '(y)', note: 'sumFyRest' }),
  ],
  bodies: (v, g, ctx, tk) => [{
    title: tk('bodies.block', 'Block'), axis: 0,
    forces: [
      { label: 'mg', angle: 270, value: W(val(v, 'm'), g), color: 'muted' },
      { label: 'N', angle: 90, value: val(v, 'N'), color: 'primary' },
      { label: 'F', angle: val(v, 'th', 0) * D, value: val(v, 'F'), color: 'second', components: Math.abs(val(v, 'th', 0)) > 1e-6, compLabels: ['F\\cos\\theta', 'F\\sin\\theta'] },
    ],
    accel: { angle: 0, value: val(v, 'a') },
    eqs: ['\\Sigma F_x = F\\cos\\theta = m\\,a', '\\Sigma F_y = N + F\\sin\\theta - mg = 0'],
  }],
  course: v => ({ eqs: ['F\\cos\\theta = m\\,a', `${n(val(v, 'F') * Math.cos(val(v, 'th', 0)))} = (${n(v.m)})\\,a \\;\\Rightarrow\\; a = ${n(v.a)}\\,\\text{m/s}^2`] }),
  check: (v, g) => [checkLine('\\Sigma F_x', [[1, v.F * Math.cos(v.th)]], v.m, v.a)],
  scene: (ctx, w, h, v, m, time, c) => pullScene(ctx, w, h, c, { p: progress(m, time), th: val(v, 'th', 0) }),
  presets: [
    { id: 'sled', data: { m: [7.5, 'kg'], F: [21, 'N'], th: [15, 'deg'] }, asked: ['a', 'N'] },
    { id: 'sledFlat', data: { m: [7.5, 'kg'], F: [21, 'N'], th: [0, 'deg'] }, asked: ['a'] },
    { id: 'liftOff', data: { m: [7.5, 'kg'], th: [15, 'deg'], N: [0, 'N'] }, asked: ['F', 'a'] },
  ],
}

const incline = {
  id: 'incline', group: 'blocks', moving: true,
  vars: { m: V.mass('m'), th: V.angle('\\theta', 'inclineAngle', 0, 90), T: V.force('T', 'tension'), N: V.force('N', 'normal'), a: V.accel },
  order: ['m', 'th', 'T', 'N', 'a'],
  eqs: () => [
    eq('n1', 'm*g*sin(th) - T = m*a', { label: '(x)', note: 'inclineX' }),
    eq('n2', 'N - m*g*cos(th) = 0', { label: '(y)', note: 'inclineY' }),
  ],
  bodies: (v, g, ctx, tk) => {
    const th = val(v, 'th', 0.5) * D
    return [{
      title: tk('bodies.block', 'Block'), axis: -th,
      forces: [
        { label: 'mg', angle: 270, value: W(val(v, 'm'), g), color: 'muted', components: true, compLabels: ['mg\\sin\\theta', 'mg\\cos\\theta'] },
        { label: 'N', angle: 90 - th, value: val(v, 'N'), color: 'primary' },
        { label: 'T', angle: 180 - th, value: val(v, 'T'), color: 'second' },
      ],
      accel: { angle: -th, value: val(v, 'a') },
      eqs: ['\\Sigma F_x = mg\\sin\\theta - T = m\\,a', '\\Sigma F_y = N - mg\\cos\\theta = 0'],
    }]
  },
  course: v => ({ eqs: ['mg\\sin\\theta - T = m\\,a'] }),
  check: (v, g) => [checkLine('\\Sigma F_x', [[1, v.m * g * Math.sin(v.th)], [-1, v.T]], v.m, v.a), checkLine('\\Sigma F_y', [[1, v.N], [-1, v.m * g * Math.cos(v.th)]], v.m, 0)],
  scene: (ctx, w, h, v, m, time, c) => inclineScene(ctx, w, h, c, { th: val(v, 'th', 0.5), p: progress(m, time), rope: val(v, 'T', 0) > 1e-9 }),
  presets: [
    { id: 'box', data: { m: [5, 'kg'], th: [30, 'deg'], T: [0, 'N'] }, asked: ['a', 'N'] },
    { id: 'held', data: { m: [18, 'kg'], th: [27, 'deg'] }, condition: 'equilibrium', asked: ['T', 'N'] },
    { id: 'cut', data: { m: [18, 'kg'], th: [27, 'deg'], T: [0, 'N'] }, asked: ['a'] },
  ],
}

const atwood = {
  id: 'atwood', group: 'pulleys', moving: true,
  vars: { m1: V.mass('m_1', 'mass1'), m2: V.mass('m_2', 'mass2'), T: V.force('T', 'tension'), a: V.accel },
  order: ['m1', 'm2', 'T', 'a'],
  eqs: () => [
    eq('n1', 'T - m1*g = m1*a', { label: '(1)', note: 'atwood1' }),
    eq('n2', 'm2*g - T = m2*a', { label: '(2)', note: 'atwood2' }),
  ],
  bodies: (v, g, ctx, tk) => [
    { title: tk('bodies.m1', 'Block 1'), axis: 0, forces: [{ label: 'T', angle: 90, value: val(v, 'T'), color: 'second' }, { label: 'm_1 g', angle: 270, value: W(val(v, 'm1'), g), color: 'muted' }], accel: { angle: 90, value: val(v, 'a') }, eqs: ['T - m_1 g = m_1 a'] },
    { title: tk('bodies.m2', 'Block 2'), axis: 0, forces: [{ label: 'T', angle: 90, value: val(v, 'T'), color: 'second' }, { label: 'm_2 g', angle: 270, value: W(val(v, 'm2'), g), color: 'muted' }], accel: { angle: 270, value: val(v, 'a') }, eqs: ['m_2 g - T = m_2 a'] },
  ],
  course: (v, g) => ({ eqs: ['m_2 g - m_1 g = (m_1 + m_2)\\,a', `a = \\frac{(m_2 - m_1)\\,g}{m_1 + m_2} = ${n(v.a)}\\,\\text{m/s}^2`, 'T = \\frac{2 m_1 m_2\\,g}{m_1 + m_2}'] }),
  check: (v, g) => [checkLine('m_1', [[1, v.T], [-1, v.m1 * g]], v.m1, v.a), checkLine('m_2', [[1, v.m2 * g], [-1, v.T]], v.m2, v.a)],
  scene: (ctx, w, h, v, m, time, c) => atwoodScene(ctx, w, h, c, { p: progress(m, time) }),
  presets: [
    { id: 'atwood', data: { m1: [2, 'kg'], m2: [3, 'kg'] }, asked: ['a', 'T'] },
    { id: 'atwoodMass', data: { m1: [2, 'kg'], a: [1.96, 'm/s2'] }, asked: ['m2', 'T'] },
  ],
}

const tableHang = {
  id: 'tableHang', group: 'pulleys', moving: true,
  vars: { m1: V.mass('m_1', 'mass1'), m2: V.mass('m_2', 'mass2'), T: V.force('T', 'tension'), N: V.force('N', 'normal'), a: V.accel },
  order: ['m1', 'm2', 'T', 'N', 'a'],
  eqs: () => [
    eq('n1', 'T = m1*a', { label: '(1x)', note: 'table1' }),
    eq('n2', 'N - m1*g = 0', { label: '(1y)', note: 'sumFyRest' }),
    eq('n3', 'm2*g - T = m2*a', { label: '(2)', note: 'hanging' }),
  ],
  bodies: (v, g, ctx, tk) => [
    { title: tk('bodies.m1', 'Block 1'), axis: 0, forces: [{ label: 'N', angle: 90, value: val(v, 'N'), color: 'primary' }, { label: 'm_1 g', angle: 270, value: W(val(v, 'm1'), g), color: 'muted' }, { label: 'T', angle: 0, value: val(v, 'T'), color: 'second' }], accel: { angle: 0, value: val(v, 'a') }, eqs: ['T = m_1 a', 'N - m_1 g = 0'] },
    { title: tk('bodies.m2', 'Block 2'), axis: 0, forces: [{ label: 'T', angle: 90, value: val(v, 'T'), color: 'second' }, { label: 'm_2 g', angle: 270, value: W(val(v, 'm2'), g), color: 'muted' }], accel: { angle: 270, value: val(v, 'a') }, eqs: ['m_2 g - T = m_2 a'] },
  ],
  course: v => ({ eqs: ['m_2 g = (m_1 + m_2)\\,a', `a = \\frac{m_2\\,g}{m_1 + m_2} = ${n(v.a)}\\,\\text{m/s}^2`] }),
  check: (v, g) => [checkLine('m_1', [[1, v.T]], v.m1, v.a), checkLine('m_2', [[1, v.m2 * g], [-1, v.T]], v.m2, v.a)],
  scene: (ctx, w, h, v, m, time, c) => tableHangScene(ctx, w, h, c, { p: progress(m, time) }),
  presets: [{ id: 'resnick8', data: { m1: [4, 'kg'], m2: [2, 'kg'] }, asked: ['a', 'T'] }],
}

const inclineHang = {
  id: 'inclineHang', group: 'pulleys', moving: true,
  vars: { m1: V.mass('m_1', 'mass1'), m2: V.mass('m_2', 'mass2'), th: V.angle('\\theta', 'inclineAngle', 0, 90), T: V.force('T', 'tension'), N: V.force('N', 'normal'), a: V.accel },
  order: ['m1', 'm2', 'th', 'T', 'N', 'a'],
  eqs: () => [
    eq('n1', 'T - m1*g*sin(th) = m1*a', { label: '(1x)', note: 'incHang1' }),
    eq('n2', 'N - m1*g*cos(th) = 0', { label: '(1y)', note: 'inclineY' }),
    eq('n3', 'm2*g - T = m2*a', { label: '(2)', note: 'hanging' }),
  ],
  bodies: (v, g, ctx, tk) => {
    const th = val(v, 'th', 0.5) * D
    return [
      { title: tk('bodies.m1', 'Block 1'), axis: th, forces: [{ label: 'm_1 g', angle: 270, value: W(val(v, 'm1'), g), color: 'muted', components: true, compLabels: ['m_1 g\\sin\\theta', 'm_1 g\\cos\\theta'] }, { label: 'N', angle: 90 + th, value: val(v, 'N'), color: 'primary' }, { label: 'T', angle: th, value: val(v, 'T'), color: 'second' }], accel: { angle: th, value: val(v, 'a') }, eqs: ['T - m_1 g\\sin\\theta = m_1 a', 'N - m_1 g\\cos\\theta = 0'] },
      { title: tk('bodies.m2', 'Block 2'), axis: 0, forces: [{ label: 'T', angle: 90, value: val(v, 'T'), color: 'second' }, { label: 'm_2 g', angle: 270, value: W(val(v, 'm2'), g), color: 'muted' }], accel: { angle: 270, value: val(v, 'a') }, eqs: ['m_2 g - T = m_2 a'] },
    ]
  },
  course: v => ({ eqs: ['m_2 g - m_1 g\\sin\\theta = (m_1 + m_2)\\,a', `a = ${n(v.a)}\\,\\text{m/s}^2`] }),
  check: (v, g) => [checkLine('m_1', [[1, v.T], [-1, v.m1 * g * Math.sin(v.th)]], v.m1, v.a), checkLine('m_2', [[1, v.m2 * g], [-1, v.T]], v.m2, v.a)],
  scene: (ctx, w, h, v, m, time, c) => inclineHangScene(ctx, w, h, c, { th: val(v, 'th', 0.5), p: progress(m, time) }),
  presets: [{ id: 'resnick10', data: { m1: [9.5, 'kg'], m2: [2.6, 'kg'], th: [34, 'deg'] }, asked: ['a', 'T'] }],
}

const contact = {
  id: 'contact', group: 'blocks', moving: true,
  vars: { F: V.force('F', 'force'), m1: V.mass('m_1', 'mass1'), m2: V.mass('m_2', 'mass2'), P: V.force('P', 'contact'), a: V.accel },
  order: ['F', 'm1', 'm2', 'P', 'a'],
  eqs: () => [
    eq('n1', 'F - P = m1*a', { label: '(1)', note: 'contact1' }),
    eq('n2', 'P = m2*a', { label: '(2)', note: 'contact2' }),
  ],
  bodies: (v, g, ctx, tk) => [
    { title: tk('bodies.m1', 'Block 1'), axis: 0, forces: [{ label: 'F', angle: 0, value: val(v, 'F'), color: 'second' }, { label: 'P', angle: 180, value: val(v, 'P'), color: 'primary' }, { label: 'N_1', angle: 90, value: W(val(v, 'm1'), g), color: 'primary' }, { label: 'm_1 g', angle: 270, value: W(val(v, 'm1'), g), color: 'muted' }], accel: { angle: 0, value: val(v, 'a') }, eqs: ['F - P = m_1 a'] },
    { title: tk('bodies.m2', 'Block 2'), axis: 0, forces: [{ label: 'P', angle: 0, value: val(v, 'P'), color: 'primary' }, { label: 'N_2', angle: 90, value: W(val(v, 'm2'), g), color: 'primary' }, { label: 'm_2 g', angle: 270, value: W(val(v, 'm2'), g), color: 'muted' }], accel: { angle: 0, value: val(v, 'a') }, eqs: ['P = m_2 a'] },
  ],
  course: v => ({ eqs: ['F = (m_1 + m_2)\\,a', `a = \\frac{F}{m_1 + m_2} = ${n(v.a)}\\,\\text{m/s}^2`, 'P = \\frac{m_2}{m_1 + m_2}\\,F'], note: '' }),
  check: (v) => [checkLine('m_1', [[1, v.F], [-1, v.P]], v.m1, v.a), checkLine('m_2', [[1, v.P]], v.m2, v.a)],
  scene: (ctx, w, h, v, m, time, c) => contactScene(ctx, w, h, c, { p: progress(m, time) }),
  presets: [{ id: 'push', data: { F: [7, 'N'], m1: [2, 'kg'], m2: [1.5, 'kg'] }, asked: ['a', 'P'] }],
}

const rope2 = {
  id: 'rope2', group: 'blocks', moving: true,
  vars: { F: V.force('F', 'force'), m1: V.mass('m_1', 'mass1'), m2: V.mass('m_2', 'mass2'), T: V.force('T', 'tension'), a: V.accel },
  order: ['F', 'm1', 'm2', 'T', 'a'],
  eqs: () => [
    eq('n1', 'T = m1*a', { label: '(1)', note: 'rope1' }),
    eq('n2', 'F - T = m2*a', { label: '(2)', note: 'rope2' }),
  ],
  bodies: (v, g, ctx, tk) => [
    { title: tk('bodies.m1', 'Block 1'), axis: 0, forces: [{ label: 'T', angle: 0, value: val(v, 'T'), color: 'second' }, { label: 'N_1', angle: 90, value: W(val(v, 'm1'), g), color: 'primary' }, { label: 'm_1 g', angle: 270, value: W(val(v, 'm1'), g), color: 'muted' }], accel: { angle: 0, value: val(v, 'a') }, eqs: ['T = m_1 a'] },
    { title: tk('bodies.m2', 'Block 2'), axis: 0, forces: [{ label: 'F', angle: 0, value: val(v, 'F'), color: 'second' }, { label: 'T', angle: 180, value: val(v, 'T'), color: 'second' }, { label: 'N_2', angle: 90, value: W(val(v, 'm2'), g), color: 'primary' }, { label: 'm_2 g', angle: 270, value: W(val(v, 'm2'), g), color: 'muted' }], accel: { angle: 0, value: val(v, 'a') }, eqs: ['F - T = m_2 a'] },
  ],
  course: v => ({ eqs: ['F = (m_1 + m_2)\\,a', `a = ${n(v.a)}\\,\\text{m/s}^2`] }),
  check: (v) => [checkLine('m_1', [[1, v.T]], v.m1, v.a), checkLine('m_2', [[1, v.F], [-1, v.T]], v.m2, v.a)],
  scene: (ctx, w, h, v, m, time, c) => contactScene(ctx, w, h, c, { p: progress(m, time), rope: true }),
  presets: [{ id: 'drag', data: { F: [68, 'N'], m1: [12, 'kg'], m2: [18, 'kg'] }, asked: ['a', 'T'] }],
}

const elevator = {
  id: 'elevator', group: 'blocks', moving: true,
  vars: { m: V.mass('m'), R: V.force('R', 'reading'), a: V.accel },
  order: ['m', 'R', 'a'],
  eqs: () => [eq('n1', 'R - m*g = m*a', { label: '(y)', note: 'elevator' })],
  bodies: (v, g, ctx, tk) => [{
    title: tk('bodies.passenger', 'Passenger'), axis: 0,
    forces: [{ label: 'R', angle: 90, value: val(v, 'R'), color: 'primary' }, { label: 'mg', angle: 270, value: W(val(v, 'm'), g), color: 'muted' }],
    accel: { angle: 90, value: val(v, 'a') }, eqs: ['R - mg = m\\,a'],
  }],
  course: v => ({ eqs: ['R = m\\,(g + a)', `R = ${n(v.R)}\\,\\text{N}`] }),
  check: (v, g) => [checkLine('\\Sigma F_y', [[1, v.R], [-1, v.m * g]], v.m, v.a)],
  scene: (ctx, w, h, v, m, time, c) => elevatorScene(ctx, w, h, c, { p: progress(m, time), reading: v.R, a: v.a }),
  presets: [
    { id: 'rest', data: { m: [72.2, 'kg'], a: [0, 'm/s2'] }, asked: ['R'] },
    { id: 'up', data: { m: [72.2, 'kg'], a: [3.2, 'm/s2'] }, asked: ['R'] },
    { id: 'fish', data: { m: [3, 'kg'], a: [-2, 'm/s2'] }, asked: ['R'] },
    { id: 'falling', data: { m: [72.2, 'kg'], a: [-9.8, 'm/s2'] }, asked: ['R'] },
  ],
}

const knot = {
  id: 'knot', group: 'equilibrium', moving: false,
  vars: { m: V.mass('m'), W: V.force('W', 'weight'), th1: V.angle('\\theta_1', 'angle1', 0, 90), th2: V.angle('\\theta_2', 'angle2', 0, 90), T1: V.force('T_1', 'tension1'), T2: V.force('T_2', 'tension2') },
  order: ['m', 'W', 'th1', 'th2', 'T1', 'T2'],
  eqs: () => [
    eq('n0', 'W = m*g', { label: '(W)', note: 'weight' }),
    eq('n1', 'T2*cos(th2) - T1*cos(th1) = 0', { label: '(x)', note: 'knotX' }),
    eq('n2', 'T1*sin(th1) + T2*sin(th2) - W = 0', { label: '(y)', note: 'knotY' }),
  ],
  bodies: (v, g, ctx, tk) => [{
    title: tk('bodies.knot', 'Knot'), axis: 0, shape: 'dot',
    forces: [
      { label: 'T_1', angle: 180 - val(v, 'th1', 0.6) * D, value: val(v, 'T1'), color: 'second', components: true, compLabels: ['T_1\\cos\\theta_1', 'T_1\\sin\\theta_1'] },
      { label: 'T_2', angle: val(v, 'th2', 0.6) * D, value: val(v, 'T2'), color: 'second', components: true, compLabels: ['T_2\\cos\\theta_2', 'T_2\\sin\\theta_2'] },
      { label: 'T_3 = W', angle: 270, value: val(v, 'W'), color: 'muted' },
    ],
    eqs: ['\\Sigma F_x = T_2\\cos\\theta_2 - T_1\\cos\\theta_1 = 0', '\\Sigma F_y = T_1\\sin\\theta_1 + T_2\\sin\\theta_2 - W = 0'],
  }],
  course: () => ({ eqs: ['\\Sigma F_x = 0', '\\Sigma F_y = 0'], note: '' }),
  check: v => [`\\Sigma F_x = ${n(v.T2 * Math.cos(v.th2) - v.T1 * Math.cos(v.th1))}\\,\\text{N},\\quad \\Sigma F_y = ${n(v.T1 * Math.sin(v.th1) + v.T2 * Math.sin(v.th2) - v.W)}\\,\\text{N}`],
  scene: (ctx, w, h, v, m, time, c) => knotScene(ctx, w, h, c, { th1: val(v, 'th1', 0.6), th2: val(v, 'th2', 0.6) }),
  presets: [
    { id: 'trafficLight', data: { W: [122, 'N'], th1: [37, 'deg'], th2: [53, 'deg'] }, asked: ['T1', 'T2'] },
    { id: 'resnick4', data: { m: [15, 'kg'], th1: [30, 'deg'], th2: [45, 'deg'] }, asked: ['T1', 'T2'] },
  ],
}

const conical = {
  id: 'conical', group: 'circular', moving: false,
  vars: {
    m: V.mass('m'), L: { tex: 'L', dim: 'length', name: 'length', range: [0, Infinity], nonzero: true },
    th: V.angle('\\theta', 'angle', 0, 90), T: V.force('T', 'tension'),
    v: { tex: 'v', dim: 'velocity', name: 'speed', range: [0, Infinity] },
    r: { tex: 'r', dim: 'length', name: 'radius', range: [0, Infinity] },
    ac: { tex: 'a_c', dim: 'acceleration', name: 'centripetalAcceleration', range: [0, Infinity] },
    P: { tex: '\\tau', dim: 'time', name: 'period', range: [0, Infinity], nonzero: true },
  },
  order: ['m', 'L', 'th', 'T', 'r', 'v', 'ac', 'P'],
  eqs: () => [
    eq('n0', 'r = L*sin(th)', { label: '(r)', note: 'conicalR' }),
    eq('n1', 'T*cos(th) = m*g', { label: '(z)', note: 'conicalZ' }),
    eq('n2', 'T*sin(th) = m*ac', { label: '(r_c)', note: 'centripetal' }),
    eq('n3', 'ac*r = v^2', { label: '(a_c)', note: 'acDef', tex: 'a_c = \\frac{v^2}{r}' }),
    eq('n4', 'P*v = 2*pi*r', { label: '(\\tau)', note: 'periodDef', tex: '\\tau = \\frac{2\\pi r}{v}' }),
  ],
  bodies: (v, g, ctx, tk) => [{
    title: tk('bodies.bob', 'Bob'), axis: 0, shape: 'dot',
    forces: [
      { label: 'T', angle: 90 + val(v, 'th', 0.4) * D, value: val(v, 'T'), color: 'second', components: true, compLabels: ['T\\sin\\theta', 'T\\cos\\theta'] },
      { label: 'mg', angle: 270, value: W(val(v, 'm'), g), color: 'muted' },
    ],
    accel: { angle: 180, value: val(v, 'ac') },
    eqs: ['T\\cos\\theta - mg = 0', 'T\\sin\\theta = m\\,\\frac{v^2}{r}'],
  }],
  course: () => ({ eqs: ['\\tan\\theta = \\frac{v^2}{r\\,g}', '\\tau = 2\\pi\\sqrt{\\frac{L\\cos\\theta}{g}}'], note: '' }),
  check: (v, g) => [`T\\cos\\theta - mg = ${n(v.T * Math.cos(v.th) - v.m * g)}\\,\\text{N}`],
  anim: () => ({ duration: 6 }),
  scene: (ctx, w, h, v, m, time, c) => conicalScene(ctx, w, h, c, { th: val(v, 'th', 0.4), time }),
  presets: [
    { id: 'resnickCone', data: { m: [0.5, 'kg'], L: [1.2, 'm'], th: [25, 'deg'] }, asked: ['P'] },
    { id: 'serway8', data: { m: [80, 'kg'], L: [10, 'm'], th: [5, 'deg'] }, asked: ['T', 'ac'] },
  ],
}

const banked = {
  id: 'banked', group: 'circular', moving: false,
  vars: {
    th: V.angle('\\theta', 'bank', 0, 89),
    v: { tex: 'v', dim: 'velocity', name: 'speed', range: [0, Infinity] },
    r: { tex: 'r', dim: 'length', name: 'radius', range: [0, Infinity], nonzero: true },
    m: { ...V.mass('m'), optional: true }, N: { ...V.force('N', 'normal'), optional: true },
    ac: { tex: 'a_c', dim: 'acceleration', name: 'centripetalAcceleration', range: [0, Infinity] },
  },
  order: ['v', 'r', 'th', 'ac', 'm', 'N'],
  eqs: () => [
    eq('n0', 'ac*r = v^2', { label: '(a_c)', note: 'acDef', tex: 'a_c = \\frac{v^2}{r}' }),
    eq('n1', 'tan(th)*g = ac', { label: '(\\theta)', note: 'bankDivide', tex: '\\tan\\theta = \\frac{v^2}{r\\,g}' }),
    eq('n2', 'N*cos(th) = m*g', { label: '(z)', note: 'bankZ' }),
  ],
  bodies: (v, g, ctx, tk) => [{
    title: tk('bodies.car', 'Car'), axis: 0,
    forces: [
      { label: 'N', angle: 90 + val(v, 'th', 0.3) * D, value: val(v, 'N'), color: 'primary', components: true, compLabels: ['N\\sin\\theta', 'N\\cos\\theta'] },
      { label: 'mg', angle: 270, value: Number.isFinite(v.m) ? v.m * g : NaN, color: 'muted' },
    ],
    accel: { angle: 180, value: val(v, 'ac') },
    eqs: ['N\\cos\\theta - mg = 0', 'N\\sin\\theta = m\\,\\frac{v^2}{r}'],
  }],
  course: () => ({ eqs: ['\\frac{N\\sin\\theta}{N\\cos\\theta} = \\frac{m v^2 / r}{m g} \\;\\Rightarrow\\; \\tan\\theta = \\frac{v^2}{r g}'], note: '' }),
  anim: () => ({ duration: 4 }),
  scene: (ctx, w, h, v, m, time, c) => bankedScene(ctx, w, h, c, { th: val(v, 'th', 0.3) }),
  presets: [
    { id: 'serwayBank', data: { v: [13.4, 'm/s'], r: [35, 'm'] }, asked: ['th'] },
    { id: 'highway', data: { v: [90, 'km/h'], r: [200, 'm'], m: [1200, 'kg'] }, asked: ['th', 'N'] },
  ],
}

const vcircle = {
  id: 'vcircle', group: 'circular', moving: false,
  dirs: ['bottom', 'top', 'hill'], dirTitle: 'pointTitle',
  vars: {
    m: V.mass('m'), r: { tex: 'r', dim: 'length', name: 'radius', range: [0, Infinity], nonzero: true },
    v: { tex: 'v', dim: 'velocity', name: 'speed', range: [0, Infinity] },
    T: V.force('T', 'tension'), ac: { tex: 'a_c', dim: 'acceleration', name: 'centripetalAcceleration', range: [0, Infinity] },
  },
  order: ['m', 'r', 'v', 'T', 'ac'],
  eqs: ctx => [
    ctx.dir === 'top' ? eq('n1', 'T + m*g = m*ac', { label: '(r)', note: 'vcTop' })
      : ctx.dir === 'hill' ? eq('n1', 'm*g - T = m*ac', { label: '(r)', note: 'vcHill' })
        : eq('n1', 'T - m*g = m*ac', { label: '(r)', note: 'vcBottom' }),
    eq('n2', 'ac*r = v^2', { label: '(a_c)', note: 'acDef', tex: 'a_c = \\frac{v^2}{r}' }),
  ],
  bodies: (v, g, ctx, tk) => {
    const top = ctx.dir === 'top'
    const hill = ctx.dir === 'hill'
    return [{
      title: tk(`bodies.${ctx.dir ?? 'bottom'}`, 'Body'), axis: 0, shape: hill ? 'box' : 'dot',
      forces: [
        { label: hill ? 'N' : 'T', angle: top ? 270 : 90, value: val(v, 'T'), color: hill ? 'primary' : 'second', keepZero: true },
        { label: 'mg', angle: 270, value: W(val(v, 'm'), g), color: 'muted' },
      ],
      accel: { angle: top || hill ? 270 : 90, value: val(v, 'ac') },
      eqs: [top ? 'T + mg = m\\frac{v^2}{r}' : hill ? 'mg - N = m\\frac{v^2}{r}' : 'T - mg = m\\frac{v^2}{r}'],
    }]
  },
  course: (v, g, ctx) => ({ eqs: [ctx.dir === 'top' ? 'T = m\\left(\\frac{v^2}{r} - g\\right)' : ctx.dir === 'hill' ? 'N = m\\left(g - \\frac{v^2}{r}\\right)' : 'T = m\\left(g + \\frac{v^2}{r}\\right)'], note: '' }),
  anim: () => ({ duration: 6 }),
  scene: (ctx, w, h, v, m, time, c, dctx) => verticalCircleScene(ctx, w, h, c, { point: dctx.dir ?? 'bottom', time }),
  presets: [
    { id: 'topString', data: { m: [0.4, 'kg'], r: [0.5, 'm'], v: [4, 'm/s'] }, options: { dir: 'top' }, asked: ['T'] },
    { id: 'bucket', data: { m: [2, 'kg'], r: [1, 'm'], T: [0, 'N'] }, options: { dir: 'top' }, asked: ['v'] },
    { id: 'tarzan', data: { m: [85, 'kg'], r: [10, 'm'], v: [8, 'm/s'] }, options: { dir: 'bottom' }, asked: ['T'] },
    { id: 'swing', data: { m: [40, 'kg'], r: [3, 'm'], T: [700, 'N'] }, options: { dir: 'bottom' }, asked: ['v'] },
    { id: 'bump', data: { m: [1000, 'kg'], r: [20, 'm'], T: [0, 'N'] }, options: { dir: 'hill' }, asked: ['v'] },
  ],
}

const tableString = {
  id: 'tableString', group: 'circular', moving: false,
  vars: {
    m: V.mass('m'), r: { tex: 'r', dim: 'length', name: 'radius', range: [0, Infinity], nonzero: true },
    v: { tex: 'v', dim: 'velocity', name: 'speed', range: [0, Infinity] },
    T: V.force('T', 'tension'), ac: { tex: 'a_c', dim: 'acceleration', name: 'centripetalAcceleration', range: [0, Infinity] },
  },
  order: ['m', 'r', 'v', 'T', 'ac'],
  eqs: () => [
    eq('n1', 'T = m*ac', { label: '(r)', note: 'centripetal' }),
    eq('n2', 'ac*r = v^2', { label: '(a_c)', note: 'acDef', tex: 'a_c = \\frac{v^2}{r}' }),
  ],
  bodies: (v, g, ctx, tk) => [{
    title: tk('bodies.puck', 'Puck (seen from the side)'), axis: 0,
    forces: [{ label: 'T', angle: 180, value: val(v, 'T'), color: 'second' }, { label: 'N', angle: 90, value: W(val(v, 'm'), g), color: 'primary' }, { label: 'mg', angle: 270, value: W(val(v, 'm'), g), color: 'muted' }],
    accel: { angle: 180, value: val(v, 'ac') }, eqs: ['T = m\\,\\frac{v^2}{r}', 'N - mg = 0'],
  }],
  course: () => ({ eqs: ['T = m\\,\\frac{v^2}{r}'], note: '' }),
  anim: () => ({ duration: 6 }),
  scene: (ctx, w, h, v, m, time, c) => topViewScene(ctx, w, h, c, { time, kind: 'string' }),
  presets: [{ id: 'breaking', data: { m: [3, 'kg'], r: [0.8, 'm'], T: [245, 'N'] }, asked: ['v'] }],
}

const topic = makeDynamicsTopic({
  key: 'newton',
  setups: [pull, incline, contact, rope2, elevator, atwood, tableHang, inclineHang, knot, conical, banked, vcircle, tableString],
})

export default {
  main() {
    new TopicPage(topic).main()
  },
}
