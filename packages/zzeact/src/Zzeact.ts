import ZzeactVersion from '@/shared/ZzeactVersion'

import {
  createElement,
} from './ZzeactElement'

interface Zzeact extends UsingDefault {
  version: string
  createElement: Function
}

const Zzeact: Zzeact = {
  version: ZzeactVersion,
  createElement,
}

export default Zzeact
