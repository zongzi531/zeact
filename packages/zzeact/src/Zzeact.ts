import ZzeactVersion from '@/shared/ZzeactVersion'

interface IZzeact {
  version: string
  default?: any
}

const Zzeact: IZzeact = {
  version: ZzeactVersion,
}

export default Zzeact
