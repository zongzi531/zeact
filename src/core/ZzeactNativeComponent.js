import ZzeactComponent from './ZzeactComponent'
import CSSPropertyOperations from '@/domUtils/CSSPropertyOperations'
import DOMPropertyOperations from '@/domUtils/DOMPropertyOperations'
import merge from '@/utils/merge'
import keyOf from '@/vendor/core/keyOf'
import escapeTextForBrowser from '@/utils/escapeTextForBrowser'
import flattenChildren from '@/utils/flattenChildren'
import ZzeactMultiChild from './ZzeactMultiChild'
import ZzeactEvent from './ZzeactEvent'
import invariant from '@/vendor/core/invariant'

const { registrationNames, putListener } = ZzeactEvent

const CONTENT_TYPES = { 'string': true, 'number': true }
const CONTENT = keyOf({ content: null })
const DANGEROUSLY_SET_INNER_HTML = keyOf({ dangerouslySetInnerHTML: null })
const STYLE = keyOf({ style: null })

const assertValidProps = props => {
  if (!props) {
    return
  }
  // Note the use of `!=` which checks for null or undefined.
  const hasChildren = props.children != null ? 1 : 0
  const hasContent = props.content != null ? 1 : 0
  const hasInnerHTML = props.dangerouslySetInnerHTML != null ? 1 : 0
  invariant(
    hasChildren + hasContent + hasInnerHTML <= 1,
    'Can only set one of `children`, `props.content`, or ' +
    '`props.dangerouslySetInnerHTML`.'
  )
  invariant(
    props.style == null || typeof props.style === 'object',
    'The `style` prop expects a mapping from style properties to values, ' +
    'not a string.'
  )
}

export default class ZzeactNativeComponent {
  constructor (tag, omitClose) {
    this._tagOpen = `<${tag} `
    this._tagClose = omitClose ? '' : `</${tag}>`
    this.tagName = tag.toUpperCase()
  }
}

ZzeactNativeComponent.Mixin = {
  mountComponent (rootID, transaction) {
    ZzeactComponent.Mixin.mountComponent.call(this, rootID, transaction)
    assertValidProps(this.props)
    // 拼接 markup
    return (
      this._createOpenTagMarkup() +
      this._createContentMarkup(transaction) +
      this._tagClose
    )
  },
  // 创建标签开始标记
  _createOpenTagMarkup () {
    const props = this.props
    let ret = this._tagOpen

    for (const propKey in props) {
      if (!props.hasOwnProperty(propKey)) {
        continue
      }
      let propValue = props[propKey]
      if (propValue == null) {
        continue
      }
      // 因为还没有对 registrationNames 进行操作，
      // 所以暂时没有办法进入该分支
      // 调用 putListener
      if (registrationNames[propKey]) {
        putListener(this._rootNodeID, propKey, propValue)
      } else {
        if (propKey === STYLE) {
          if (propValue) {
            propValue = props.style = merge(props.style)
          }
          propValue = CSSPropertyOperations.createMarkupForStyles(propValue)
        }
        const markup = DOMPropertyOperations.createMarkupForProperty(propKey, propValue)
        if (markup) {
          ret += ' ' + markup
        }
      }
    }

    // 部分标签不是不需要闭合标签嘛，在考虑这里是否需要优化，
    // 并且在上方，若标签无需闭合标签，则也不会调用`_createContentMarkup`
    // return `${ret} id="${this._rootNodeID}"${!this._tagClose && ' /'}>`
    return `${ret} id="${this._rootNodeID}">`
  },
  // 创建标签内容标记（暂时还没写）
  _createContentMarkup (transaction) {
    // 一开始我认为 transaction 是影响到子组件的显示，但是其实发现并不是
    // transaction 只是在执行每个组件自己的一个过程而已
    const innerHTML = this.props.dangerouslySetInnerHTML
    if (innerHTML != null) {
      if (innerHTML.__html != null) {
        return innerHTML.__html
      }
    } else {
      const contentToUse = this.props.content != null
        ? this.props.content
        : CONTENT_TYPES[typeof this.props.children]
          ? this.props.children
          : null
      const childrenToUse = contentToUse != null
        ? null
        : this.props.children
      if (contentToUse != null) {
        return escapeTextForBrowser(contentToUse)
      } else if (childrenToUse != null) {
        // 影响子组件的显示是依靠这个，但是这里会接受到一个数组呢
        return this.mountMultiChild(
          flattenChildren(childrenToUse),
          transaction
        )
      }
    }
    return ''
  },
  unmountComponent () {
    // 卸载组件
    ZzeactComponent.Mixin.unmountComponent.call(this)
    this.unmountMultiChild()
    // 移除监听
    ZzeactEvent.deleteAllListeners(this._rootNodeID)
  },
  receiveProps (nextProps, transaction) {
    invariant(
      this._rootNodeID,
      'Trying to control a native dom element without a backing id'
    )
    assertValidProps(nextProps)
    ZzeactComponent.Mixin.receiveProps.call(this, nextProps, transaction)
    // 更新 DOM 属性
    this._updateDOMProperties(nextProps)
    // 更新 DOM 子节点
    this._updateDOMChildren(nextProps, transaction)
    // 更新 props
    this.props = nextProps
  },
  _updateDOMProperties (nextProps) {
    const lastProps = this.props
    for (const propKey in nextProps) {
      let nextProp = nextProps[propKey]
      const lastProp = lastProps[propKey]
      if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp) {
        continue
      }
      if (propKey === STYLE) {
        if (nextProp) {
          nextProp = nextProps.style = merge(nextProp)
        }
        let styleUpdates
        for (const styleName in nextProp) {
          if (!nextProp.hasOwnProperty(styleName)) {
            continue
          }
          if (!lastProp || lastProp[styleName] !== nextProp[styleName]) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = nextProp[styleName]
          }
        }
        if (styleUpdates) {
          // 更新 styles
          ZzeactComponent.DOMIDOperations.updateStylesByID(
            this._rootNodeID,
            styleUpdates
          )
        }
      } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
        const lastHtml = lastProp && lastProp.__html
        const nextHtml = nextProp && nextProp.__html
        if (lastHtml !== nextHtml) {
          // 更新 innerHTML
          ZzeactComponent.DOMIDOperations.updateInnerHTMLByID(
            this._rootNodeID,
            nextProp
          )
        }
      } else if (propKey === CONTENT) {
        // 更新 content
        ZzeactComponent.DOMIDOperations.updateTextContentByID(
          this._rootNodeID,
          '' + nextProp
        )
      } else if (registrationNames[propKey]) {
        // 注册对应事件
        putListener(this._rootNodeID, propKey, nextProp)
      } else {
        // 更新属性
        ZzeactComponent.DOMIDOperations.updatePropertyByID(
          this._rootNodeID,
          propKey,
          nextProp
        )
      }
    }
  },
  _updateDOMChildren (nextProps, transaction) {
    const thisPropsContentType = typeof this.props.content
    const thisPropsContentEmpty =
      this.props.content == null || thisPropsContentType === 'boolean'
    const nextPropsContentType = typeof nextProps.content
    const nextPropsContentEmpty =
      nextProps.content == null || nextPropsContentType === 'boolean'

    const lastUsedContent = !thisPropsContentEmpty ? this.props.content
      : CONTENT_TYPES[typeof this.props.children] ? this.props.children : null

    const contentToUse = !nextPropsContentEmpty ? nextProps.content
      : CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null

    // Note the use of `!=` which checks for null or undefined.

    const lastUsedChildren =
      lastUsedContent != null ? null : this.props.children
    const childrenToUse = contentToUse != null ? null : nextProps.children

    if (contentToUse != null) {
      const childrenRemoved = lastUsedChildren != null && childrenToUse == null
      if (childrenRemoved) {
        // 更新多子节点
        this.updateMultiChild(null, transaction)
      }
      if (lastUsedContent !== contentToUse) {
        // 更新 content
        ZzeactComponent.DOMIDOperations.updateTextContentByID(
          this._rootNodeID,
          '' + contentToUse
        )
      }
    } else {
      const contentRemoved = lastUsedContent != null && contentToUse == null
      if (contentRemoved) {
        // 更新 content
        ZzeactComponent.DOMIDOperations.updateTextContentByID(
          this._rootNodeID,
          ''
        )
      }
      // 更新多子节点
      this.updateMultiChild(flattenChildren(nextProps.children), transaction)
    }
  },
}

Object.assign(ZzeactNativeComponent.prototype, ZzeactComponent.Mixin)
Object.assign(ZzeactNativeComponent.prototype, ZzeactNativeComponent.Mixin)
Object.assign(ZzeactNativeComponent.prototype, ZzeactMultiChild.Mixin)
