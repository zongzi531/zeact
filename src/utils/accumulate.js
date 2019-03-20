// 这个的目的是干什么暂时没看懂
// 他将传入的 cur, next 进行检查
// 分别进行输出
// 若 next 不存在则输出 cur
// 反之若 cur 不存在，则输出 next
// 若都存在，判断是否都为数组
// 若 cur 为数组，则 cur 加入 next
// 若 next 为数组，则 [cur] 加入 next
// 其他情况返回 [cur, next]
const accumulate = (cur, next) => {
  const curValIsEmpty = cur == null // Will test for emptiness (null/undef)
  const nextValIsEmpty = next === null
  if (nextValIsEmpty) {
    return cur
  } else {
    if (curValIsEmpty) {
      return next
    } else {
      // Both are not empty. Warning: Never call x.concat(y) when you are not
      // certain that x is an Array (x could be a string with concat method).
      const curIsArray = Array.isArray(cur)
      const nextIsArray = Array.isArray(next)
      if (curIsArray) {
        return cur.concat(next)
      } else {
        if (nextIsArray) {
          return [cur].concat(next)
        } else {
          return [cur, next]
        }
      }
    }
  }
}

export default accumulate
