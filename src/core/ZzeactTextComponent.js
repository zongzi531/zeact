import ZzeactComponent from './ZzeactComponent'
import escapeTextForBrowser from '@/utils/escapeTextForBrowser'

export default class ZzeactTextComponent {
  constructor (initialText) {
    this.construct({ text: initialText })
  }
}

Object.assign(ZzeactTextComponent.prototype, ZzeactComponent.Mixin)
Object.assign(ZzeactTextComponent.prototype, {
  mountComponent (rootID) {
    ZzeactComponent.Mixin.mountComponent.call(this, rootID)
    // 挂载组件时返回的内容
    return `<span id="${rootID}">${escapeTextForBrowser(this.props.text)}</span>`
  },
  // 这个方法还没用到
  receiveProps (nextProps, transaction) {
    if (nextProps.text !== this.props.text) {
      this.props.text = nextProps.text
      ZzeactComponent.DOMIDOperations.updateTextContentByID(
        this._rootNodeID,
        nextProps.text
      )
    }
  },
})
