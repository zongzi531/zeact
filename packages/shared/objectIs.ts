// eslint-disable-next-line @typescript-eslint/no-explicit-any
function is(x: any, y: any): boolean {
  return (
    (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y)
  )
}

export default is
