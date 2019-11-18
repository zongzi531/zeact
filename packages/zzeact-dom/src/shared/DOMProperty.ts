type PropertyType = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const RESERVED = 0
export const STRING = 1
export const BOOLEANISH_STRING = 2
export const BOOLEAN = 3
export const OVERLOADED_BOOLEAN = 4
export const NUMERIC = 5
export const POSITIVE_NUMERIC = 6

export type PropertyInfo = {
  acceptsBooleans: boolean
  attributeName: string
  attributeNamespace: string | null
  mustUseProperty: boolean
  propertyName: string
  type: PropertyType
}

export const ATTRIBUTE_NAME_START_CHAR =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD'
export const ATTRIBUTE_NAME_CHAR =
  ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040'

export const ID_ATTRIBUTE_NAME = 'data-zzeactid'
export const ROOT_ATTRIBUTE_NAME = 'data-zzeactroot'
export const VALID_ATTRIBUTE_NAME_REGEX = new RegExp(
  '^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$',
)

const hasOwnProperty = Object.prototype.hasOwnProperty
const illegalAttributeNameCache = {}
const validatedAttributeNameCache = {}

export function isAttributeNameSafe(attributeName: string): boolean {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
    return true
  }
  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
    return false
  }
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true
    return true
  }
  illegalAttributeNameCache[attributeName] = true
  return false
}

export function shouldIgnoreAttribute(
  name: string,
  propertyInfo: PropertyInfo | null,
  isCustomComponentTag: boolean,
): boolean {
  if (propertyInfo !== null) {
    return propertyInfo.type === RESERVED
  }
  if (isCustomComponentTag) {
    return false
  }
  if (
    name.length > 2 &&
    (name[0] === 'o' || name[0] === 'O') &&
    (name[1] === 'n' || name[1] === 'N')
  ) {
    return true
  }
  return false
}

export function shouldRemoveAttributeWithWarning(
  name: string,
  value: mixed,
  propertyInfo: PropertyInfo | null,
  isCustomComponentTag: boolean,
): boolean {
  if (propertyInfo !== null && propertyInfo.type === RESERVED) {
    return false
  }
  switch (typeof value) {
    case 'function':
    case 'symbol':
      return true
    case 'boolean': {
      if (isCustomComponentTag) {
        return false
      }
      if (propertyInfo !== null) {
        return !propertyInfo.acceptsBooleans
      } else {
        const prefix = name.toLowerCase().slice(0, 5)
        return prefix !== 'data-' && prefix !== 'aria-'
      }
    }
    default:
      return false
  }
}

export function shouldRemoveAttribute(
  name: string,
  value: mixed,
  propertyInfo: PropertyInfo | null,
  isCustomComponentTag: boolean,
): boolean {
  if (value === null || typeof value === 'undefined') {
    return true
  }
  if (
    shouldRemoveAttributeWithWarning(
      name,
      value,
      propertyInfo,
      isCustomComponentTag,
    )
  ) {
    return true
  }
  if (isCustomComponentTag) {
    return false
  }
  if (propertyInfo !== null) {
    switch (propertyInfo.type) {
      case BOOLEAN:
        return !value
      case OVERLOADED_BOOLEAN:
        return value === false
      case NUMERIC:
        return isNaN(value)
      case POSITIVE_NUMERIC:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return isNaN(value) || (value as any) < 1
    }
  }
  return false
}

export function getPropertyInfo(name: string): PropertyInfo | null {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return properties.hasOwnProperty(name) ? properties[name] : null
}

function PropertyInfoRecord(
  name: string,
  type: PropertyType,
  mustUseProperty: boolean,
  attributeName: string,
  attributeNamespace: string | null,
): void {
  this.acceptsBooleans =
    type === BOOLEANISH_STRING ||
    type === BOOLEAN ||
    type === OVERLOADED_BOOLEAN
  this.attributeName = attributeName
  this.attributeNamespace = attributeNamespace
  this.mustUseProperty = mustUseProperty
  this.propertyName = name
  this.type = type
}

const properties = {}

;[
  'children',
  'dangerouslySetInnerHTML',
  'defaultValue',
  'defaultChecked',
  'innerHTML',
  'suppressContentEditableWarning',
  'suppressHydrationWarning',
  'style',
].forEach(name => {
  properties[name] = new PropertyInfoRecord(
    name,
    RESERVED,
    false,
    name,
    null,
  )
})

;[
  ['acceptCharset', 'accept-charset'],
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['httpEquiv', 'http-equiv'],
].forEach(([name, attributeName]) => {
  properties[name] = new PropertyInfoRecord(
    name,
    STRING,
    false,
    attributeName,
    null,
  )
})

;['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(name => {
  properties[name] = new PropertyInfoRecord(
    name,
    BOOLEANISH_STRING,
    false,
    name.toLowerCase(),
    null,
  )
})

;[
  'autoReverse',
  'externalResourcesRequired',
  'focusable',
  'preserveAlpha',
].forEach(name => {
  properties[name] = new PropertyInfoRecord(
    name,
    BOOLEANISH_STRING,
    false,
    name,
    null,
  )
})

;[
  'allowFullScreen',
  'async',
  'autoFocus',
  'autoPlay',
  'controls',
  'default',
  'defer',
  'disabled',
  'formNoValidate',
  'hidden',
  'loop',
  'noModule',
  'noValidate',
  'open',
  'playsInline',
  'readOnly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'itemScope',
].forEach(name => {
  properties[name] = new PropertyInfoRecord(
    name,
    BOOLEAN,
    false,
    name.toLowerCase(),
    null,
  )
})

;[
  'checked',
  'multiple',
  'muted',
  'selected',
].forEach(name => {
  properties[name] = new PropertyInfoRecord(
    name,
    BOOLEAN,
    true,
    name,
    null,
  )
})

;[
  'capture',
  'download',
].forEach(name => {
  properties[name] = new PropertyInfoRecord(
    name,
    OVERLOADED_BOOLEAN,
    false,
    name,
    null,
  )
})

;[
  'cols',
  'rows',
  'size',
  'span',
].forEach(name => {
  properties[name] = new PropertyInfoRecord(
    name,
    POSITIVE_NUMERIC,
    false,
    name,
    null,
  )
})

;['rowSpan', 'start'].forEach(name => {
  properties[name] = new PropertyInfoRecord(
    name,
    NUMERIC,
    false,
    name.toLowerCase(),
    null,
  )
})

const CAMELIZE = /[\-\:]([a-z])/g
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const capitalize: (token: any) => string = token => token[1].toUpperCase()

;[
  'accent-height',
  'alignment-baseline',
  'arabic-form',
  'baseline-shift',
  'cap-height',
  'clip-path',
  'clip-rule',
  'color-interpolation',
  'color-interpolation-filters',
  'color-profile',
  'color-rendering',
  'dominant-baseline',
  'enable-background',
  'fill-opacity',
  'fill-rule',
  'flood-color',
  'flood-opacity',
  'font-family',
  'font-size',
  'font-size-adjust',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-weight',
  'glyph-name',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'horiz-adv-x',
  'horiz-origin-x',
  'image-rendering',
  'letter-spacing',
  'lighting-color',
  'marker-end',
  'marker-mid',
  'marker-start',
  'overline-position',
  'overline-thickness',
  'paint-order',
  'panose-1',
  'pointer-events',
  'rendering-intent',
  'shape-rendering',
  'stop-color',
  'stop-opacity',
  'strikethrough-position',
  'strikethrough-thickness',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'text-anchor',
  'text-decoration',
  'text-rendering',
  'underline-position',
  'underline-thickness',
  'unicode-bidi',
  'unicode-range',
  'units-per-em',
  'v-alphabetic',
  'v-hanging',
  'v-ideographic',
  'v-mathematical',
  'vector-effect',
  'vert-adv-y',
  'vert-origin-x',
  'vert-origin-y',
  'word-spacing',
  'writing-mode',
  'xmlns:xlink',
  'x-height',
].forEach(attributeName => {
  const name = attributeName.replace(CAMELIZE, capitalize)
  properties[name] = new PropertyInfoRecord(
    name,
    STRING,
    false,
    attributeName,
    null,
  )
})

;[
  'xlink:actuate',
  'xlink:arcrole',
  'xlink:href',
  'xlink:role',
  'xlink:show',
  'xlink:title',
  'xlink:type',
].forEach(attributeName => {
  const name = attributeName.replace(CAMELIZE, capitalize)
  properties[name] = new PropertyInfoRecord(
    name,
    STRING,
    false,
    attributeName,
    'http://www.w3.org/1999/xlink',
  )
})

;[
  'xml:base',
  'xml:lang',
  'xml:space',
].forEach(attributeName => {
  const name = attributeName.replace(CAMELIZE, capitalize)
  properties[name] = new PropertyInfoRecord(
    name,
    STRING,
    false,
    attributeName,
    'http://www.w3.org/XML/1998/namespace',
  )
})

;['tabIndex', 'crossOrigin'].forEach(attributeName => {
  properties[attributeName] = new PropertyInfoRecord(
    attributeName,
    STRING,
    false,
    attributeName.toLowerCase(),
    null,
  )
})
