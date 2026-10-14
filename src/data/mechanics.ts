// Física Mecánica: the hub lives at /projects/fisica-mecanica and every topic
// has its own page under it. `key` is the dictionary namespace of the topic
// (src/data/i18n/mechanics/<key>.ts) and of its module (public/js/lib/mechanics).

export interface MechanicsTopic {
  slug: string
  key: string
  title: string
  group: 'kinematics' | 'dynamics'
}

export const MECHANICS_BASE = '/projects/fisica-mecanica'

export const MECHANICS_TOPICS: MechanicsTopic[] = [
  { slug: 'movimiento-1d', key: 'oneDim', title: 'Motion in one dimension', group: 'kinematics' },
  { slug: 'movimiento-uniforme', key: 'uniform', title: 'Uniform motion', group: 'kinematics' },
  { slug: 'movimiento-acelerado', key: 'accelerated', title: 'Uniformly accelerated motion', group: 'kinematics' },
  { slug: 'caida-libre', key: 'freeFall', title: 'Free fall', group: 'kinematics' },
  { slug: 'lanzamiento-vertical', key: 'vertical', title: 'Vertical throws', group: 'kinematics' },
  { slug: 'movimiento-parabolico', key: 'projectile', title: 'Projectile motion', group: 'kinematics' },
  { slug: 'movimiento-circular', key: 'circular', title: 'Circular motion', group: 'kinematics' },
  { slug: 'leyes-de-newton', key: 'newton', title: "Newton's laws", group: 'dynamics' },
  { slug: 'friccion', key: 'friction', title: 'Friction', group: 'dynamics' },
]
