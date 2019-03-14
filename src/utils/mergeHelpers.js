import keyMirror from './keyMirror'
import throwIf from './throwIf'

const MAX_MERGE_DEPTH = 36

const ERRORS = {
  MERGE_ARRAY_FAIL:
    'Unsupported type passed to a merge function. You may have passed a ' +
    'structure that contains an array and the merge function does not know ' +
    'how to merge arrays. ',

  MERGE_CORE_FAILURE:
    'Critical assumptions about the merge functions have been violated. ' +
    'This is the fault of the merge functions themselves, not necessarily ' +
    'the callers.',

  MERGE_TYPE_USAGE_FAILURE:
    'Calling merge function with invalid types. You may call merge ' +
    'functions (non-array non-terminal) OR (null/undefined) arguments. ' +
    'mergeInto functions have the same requirements but with an added ' +
    'restriction that the first parameter must not be null/undefined.',

  MERGE_DEEP_MAX_LEVELS:
    'Maximum deep merge depth exceeded. You may attempting to merge ' +
    'circular structures in an unsupported way.',
  MERGE_DEEP_NO_ARR_STRATEGY:
    'You must provide an array strategy to deep merge functions to ' +
    'instruct the deep merge how to resolve merging two arrays.'
}

const isTerminal = o => typeof o !== 'object' || o === null

const mergeHelpers = {
  MAX_MERGE_DEPTH,
  isTerminal,
  normalizeMergeArg: arg => arg === undefined || arg === null ? {} : arg,
  checkMergeArrayArgs(one, two) {
    throwIf(
      !Array.isArray(one) || !Array.isArray(two),
      ERRORS.MERGE_CORE_FAILURE
    )
  },
  checkMergeObjectArgs(one, two) {
    mergeHelpers.checkMergeObjectArg(one)
    mergeHelpers.checkMergeObjectArg(two)
  },
  checkMergeObjectArg(arg) {
    throwIf(isTerminal(arg) || Array.isArray(arg), ERRORS.MERGE_CORE_FAILURE)
  },
  checkMergeLevel(level) {
    throwIf(level >= MAX_MERGE_DEPTH, ERRORS.MERGE_DEEP_MAX_LEVELS)
  },
  checkArrayStrategy(strategy) {
    throwIf(
      strategy !== undefined && !(strategy in mergeHelpers.ArrayStrategies),
      ERRORS.MERGE_DEEP_NO_ARR_STRATEGY
    )
  },
  ArrayStrategies: keyMirror({
    Clobber: true,
    IndexByIndex: true
  }),
  ERRORS,
}

export default mergeHelpers
