import ZzeactComponent from './ZzeactComponent'
import CSSPropertyOperations from '@/domUtils/CSSPropertyOperations'
import DOMPropertyOperations from '../domUtils/DOMPropertyOperations'
import merge from '@/utils/merge'
import keyOf from '@/vendor/core/keyOf'

const STYLE = keyOf({ style: null })

export default class ZzeactNativeComponent {
  constructor (tag, omitClose) {
    this._tagOpen = `<${tag} `
    this._tagClose = omitClose ? '' : `</${tag}>`
    this.tagName = tag.toUpperCase()
  }
}

ZzeactNativeComponent.Mixin = {
  mountComponent (rootID) {
    ZzeactComponent.Mixin.mountComponent.call(this, rootID)
    return (
      this._createOpenTagMarkup() +
      this._createContentMarkup() +
      this._tagClose
    )
  },
  // 创建标签开始标记
  _createOpenTagMarkup () {
    const props = this.props
    let ret = this._tagOpen

    for (const propKey in props) {
      // 注册 Event 似乎是从这里注册的
      if (!props.hasOwnProperty(propKey)) {
        continue
      }
      let propValue = props[propKey]
      if (propValue == null) {
        continue
      }
      if (propKey === STYLE) {
        if (propValue) {
          propValue = props.style = merge(props.style)
        }
        propValue = CSSPropertyOperations.createMarkupForStyles(propValue)
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
  _createContentMarkup () {
    return this.props.children
    // return ''
  },
}

Object.assign(ZzeactNativeComponent.prototype, ZzeactComponent.Mixin)
Object.assign(ZzeactNativeComponent.prototype, ZzeactNativeComponent.Mixin)
