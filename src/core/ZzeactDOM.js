import ZzeactNativeComponent from './ZzeactNativeComponent'
import objMapKeyVal from '@/utils/objMapKeyVal'

const createDOMComponentClass = (tag, omitClose) => {
  class Constructor {
    constructor (initialProps, children) {
      // 原生DOM节点也会调这个
      this.construct(initialProps, children)
    }
  }

  // 使用ZzeactNativeComponent来创造原生DOM节点
  Constructor.prototype = new ZzeactNativeComponent(tag, omitClose)
  Constructor.prototype.constructor = Constructor

  return function (props, children) {
    return new Constructor(props, children)
  }
}

/**
 * DOM对象经过 `objMapKeyVal` 调用后返回一个可调用函数，如：
 * ```javascript
 * Zzeact.DOM.p(props, children)
 * ```
 * 这里通过工厂函数返回的都是原生DOM节点对应的函数
 * 在编写 examples 时，对一些 HTML5 的标签进行了添加，
 * 同样的，也有些标签是 `JSXTransformer.js` 没有包含的，
 * 所以同时需要在 `JSXTransformer.js` 中进行添加即可
 */
const ZzeactDOM = objMapKeyVal({
  a: false,
  abbr: false,
  address: false,
  article: false,
  audio: false,
  b: false,
  body: false,
  br: true,
  button: false,
  caption: false,
  code: false,
  col: true,
  colgroup: false,
  dd: false,
  div: false,
  section: false,
  dl: false,
  dt: false,
  em: false,
  embed: true,
  fieldset: false,
  figcaption: false,
  figure: false,
  footer: false,
  // Danger: this gets monkeypatched! See ReactDOMForm for more info.
  form: false,
  h1: false,
  h2: false,
  h3: false,
  h4: false,
  h5: false,
  h6: false,
  header: false,
  hr: true,
  i: false,
  iframe: false,
  img: true,
  input: true,
  label: false,
  legend: false,
  li: false,
  line: false,
  main: false,
  nav: false,
  object: false,
  ol: false,
  optgroup: false,
  option: false,
  p: false,
  param: true,
  pre: false,
  select: false,
  small: false,
  source: false,
  span: false,
  sub: false,
  sup: false,
  strong: false,
  table: false,
  tbody: false,
  td: false,
  textarea: false,
  tfoot: false,
  th: false,
  thead: false,
  time: false,
  title: false,
  tr: false,
  u: false,
  ul: false,
  var: false,
  video: false,
  wbr: false,

  // SVG
  circle: false,
  g: false,
  path: false,
  polyline: false,
  rect: false,
  svg: false,
  text: false,
}, createDOMComponentClass)

export default ZzeactDOM
