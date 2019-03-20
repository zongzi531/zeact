import ZzeactTextComponent from '@/core/ZzeactTextComponent'
import escapeTextForBrowser from '@/utils/escapeTextForBrowser'
import throwIf from '@/utils/throwIf'

const INVALID_CHILD =
  'You may not pass a child of that type to a React component. It ' +
  'is a common mistake to try to pass a standard browser DOM element ' +
  'as a child of a React component.'

const ONLY_CHILD_NAME = '0'

const flattenChildrenImpl = (res, children, nameSoFar) => {
  // 这里你会发现若 children 仅为一个的时候，他是 0
  // 若为多个的时候，他是 [number]
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      flattenChildrenImpl(res, children[i], nameSoFar + '[' + i + ']')
    }
  } else {
    const type = typeof children
    const isOnlyChild = nameSoFar === ''
    const storageName = isOnlyChild ? ONLY_CHILD_NAME : nameSoFar
    if (children === null || children === undefined || type === 'boolean') {
      res[storageName] = null
    } else if (children.mountComponentIntoNode) {
      /* We found a component instance */
      res[storageName] = children
    } else {
      if (type === 'object') {
        // 这一段不知道怎样的场景会遇到
        throwIf(children && children.nodeType === 1, INVALID_CHILD)
        for (let key in children) {
          if (children.hasOwnProperty(key)) {
            flattenChildrenImpl(
              res,
              children[key],
              nameSoFar + '{' + escapeTextForBrowser(key) + '}'
            )
          }
        }
      // 当 children 的类型为 string 或是 number，最终都以 ZzeactTextComponent 输出
      } else if (type === 'string') {
        res[storageName] = new ZzeactTextComponent(children)
      } else if (type === 'number') {
        res[storageName] = new ZzeactTextComponent('' + children)
      }
    }
  }
}

const flattenChildren = (children) => {
  if (children === null || children === undefined) {
    return children
  }
  const result = {}
  // 产出这个 result
  flattenChildrenImpl(result, children, '')
  return result
}

export default flattenChildren
