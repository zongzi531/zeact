import ZzeactVersion from '@/shared/ZzeactVersion'
import { createElement } from './ZzeactElement'

interface IZzeact {
  createElement: createElement
  default?: any
  version: string
}

const Zzeact: IZzeact = {
  createElement,
  version: ZzeactVersion,
}

export default Zzeact
