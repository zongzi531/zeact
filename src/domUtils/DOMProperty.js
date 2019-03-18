import invariant from '@/vendor/core/invariant'

const DOMProperty = {
  isStandardName: {},
  getAttributeName: {},
  getPropertyName: {},
  getMutationMethod: {},
  mustUseAttribute: {},
  mustUseProperty: {},
  hasBooleanValue: {},
  hasSideEffects: {},
  isCustomAttribute: RegExp.prototype.test.bind(
    /^(data|aria)-[a-z_][a-z\d_.\-]*$/
  ),
}

// 这个就有点超纲了 兄弟
const MustUseAttribute = 0x1
const MustUseProperty = 0x2
const HasBooleanValue = 0x4
const HasSideEffects = 0x8

const Properties = {
  /**
   * Standard Properties
   */
  accept: null,
  action: null,
  ajaxify: MustUseAttribute,
  allowFullScreen: MustUseAttribute | HasBooleanValue,
  alt: null,
  autoComplete: null,
  autoplay: HasBooleanValue,
  cellPadding: null,
  cellSpacing: null,
  checked: MustUseProperty | HasBooleanValue,
  className: MustUseProperty,
  colSpan: null,
  contentEditable: null,
  controls: MustUseProperty | HasBooleanValue,
  data: null, // For `<object />` acts as `src`.
  dir: null,
  disabled: MustUseProperty | HasBooleanValue,
  enctype: null,
  height: null,
  href: null,
  htmlFor: null,
  max: null,
  method: null,
  min: null,
  multiple: MustUseProperty | HasBooleanValue,
  name: null,
  poster: null,
  preload: null,
  placeholder: null,
  rel: null,
  required: HasBooleanValue,
  role: MustUseAttribute,
  scrollLeft: MustUseProperty,
  scrollTop: MustUseProperty,
  selected: MustUseProperty | HasBooleanValue,
  spellCheck: null,
  src: null,
  step: null,
  style: null,
  tabIndex: null,
  target: null,
  title: null,
  type: null,
  value: MustUseProperty | HasSideEffects,
  width: null,
  wmode: MustUseAttribute,
  /**
   * SVG Properties
   */
  cx: MustUseProperty,
  cy: MustUseProperty,
  d: MustUseProperty,
  fill: MustUseProperty,
  fx: MustUseProperty,
  fy: MustUseProperty,
  points: MustUseProperty,
  r: MustUseProperty,
  stroke: MustUseProperty,
  strokeLinecap: MustUseProperty,
  strokeWidth: MustUseProperty,
  transform: MustUseProperty,
  x: MustUseProperty,
  x1: MustUseProperty,
  x2: MustUseProperty,
  version: MustUseProperty,
  viewBox: MustUseProperty,
  y: MustUseProperty,
  y1: MustUseProperty,
  y2: MustUseProperty,
  spreadMethod: MustUseProperty,
  offset: MustUseProperty,
  stopColor: MustUseProperty,
  stopOpacity: MustUseProperty,
  gradientUnits: MustUseProperty,
  gradientTransform: MustUseProperty,
}

const DOMAttributeNames = {
  className: 'class',
  htmlFor: 'for',
  strokeLinecap: 'stroke-linecap',
  strokeWidth: 'stroke-width',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
}

const DOMPropertyNames = {
  autoComplete: 'autocomplete',
  spellCheck: 'spellcheck',
}

const DOMMutationMethods = {
  className: function (node, value) {
    node.className = value || ''
  },
}

for (const propName in Properties) {
  DOMProperty.isStandardName[propName] = true

  DOMProperty.getAttributeName[propName] =
    DOMAttributeNames[propName] || propName.toLowerCase()

  DOMProperty.getPropertyName[propName] =
    DOMPropertyNames[propName] || propName

  const mutationMethod = DOMMutationMethods[propName]
  if (mutationMethod) {
    DOMProperty.getMutationMethod[propName] = mutationMethod
  }

  const propConfig = Properties[propName]
  // 就是这里，用了`&`操作符
  DOMProperty.mustUseAttribute[propName] = propConfig & MustUseAttribute
  DOMProperty.mustUseProperty[propName] = propConfig & MustUseProperty
  DOMProperty.hasBooleanValue[propName] = propConfig & HasBooleanValue
  DOMProperty.hasSideEffects[propName] = propConfig & HasSideEffects

  invariant(
    !DOMProperty.mustUseAttribute[propName] ||
    !DOMProperty.mustUseProperty[propName],
    'DOMProperty: Cannot use require using both attribute and property: %s',
    propName
  )
  invariant(
    DOMProperty.mustUseProperty[propName] ||
    !DOMProperty.hasSideEffects[propName],
    'DOMProperty: Properties that have side effects must use property: %s',
    propName
  )
}

export default DOMProperty
