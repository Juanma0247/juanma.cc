// Page-scoped dictionaries of Física Mecánica. MechanicsLayout sends only the
// common strings plus those of the current page (see MainLayout's i18nExtra).
import { common } from './common'
import { hub } from './hub'
import { oneDim } from './oneDim'
import { uniform } from './uniform'
import { accelerated } from './accelerated'
import { freeFall } from './freeFall'
import { vertical } from './vertical'
import { projectile } from './projectile'
import { circular } from './circular'
import { newton } from './newton'
import { friction } from './friction'

export const mechanicsDict = {
  common,
  hub,
  oneDim,
  uniform,
  accelerated,
  freeFall,
  vertical,
  projectile,
  circular,
  newton,
  friction,
}
