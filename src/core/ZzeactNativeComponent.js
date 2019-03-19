import ZzeactComponent from './ZzeactComponent'
import CSSPropertyOperations from '@/domUtils/CSSPropertyOperations'
import DOMPropertyOperations from '@/domUtils/DOMPropertyOperations'
import merge from '@/utils/merge'
import keyOf from '@/vendor/core/keyOf'
import escapeTextForBrowser from '@/utils/escapeTextForBrowser'
import flattenChildren from '@/utils/flattenChildren'
import ZzeactMultiChild from './ZzeactMultiChild'
import ZzeactEvent from './ZzeactEvent'

const { registrationNames, putListener } = ZzeactEvent

const CONTENT_TYPES = { 'string': true, 'number': true }

const STYLE = keyOf({ style: null })

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
}

Object.assign(ZzeactNativeComponent.prototype, ZzeactComponent.Mixin)
Object.assign(ZzeactNativeComponent.prototype, ZzeactNativeComponent.Mixin)
Object.assign(ZzeactNativeComponent.prototype, ZzeactMultiChild.Mixin)
