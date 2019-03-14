import mergeInto from './mergeInto'

const merge = (one, two) => {
  const result = {}
  mergeInto(result, one)
  mergeInto(result, two)
  return result
}

export default merge
