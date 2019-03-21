import copyProperties from './copyProperties'

const makeEmptyFunction = (arg) => {
  return function () {
    return arg
  }
}

function emptyFunction () { }

copyProperties(emptyFunction, {
  thatReturns: makeEmptyFunction,
  thatReturnsFalse: makeEmptyFunction(false),
  thatReturnsTrue: makeEmptyFunction(true),
  thatReturnsNull: makeEmptyFunction(null),
  thatReturnsThis: function () { return this },
  thatReturnsArgument: function (arg) { return arg },
  mustImplement: function (module, property) {
    return function () {}
  },
})

export default emptyFunction
