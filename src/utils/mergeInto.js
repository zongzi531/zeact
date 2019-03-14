import mergeHelpers from './mergeHelpers'

const { checkMergeObjectArg } = mergeHelpers

const mergeInto = (one, two) => {
  checkMergeObjectArg(one)
  if (two != null) {
    checkMergeObjectArg(two)
    for (const key in two) {
      if (!two.hasOwnProperty(key)) {
        continue
      }
      one[key] = two[key]
    }
  }
}

export default mergeInto
