import dangerousStyleValue from './dangerousStyleValue'
import hyphenate from '@/vendor/core/hyphenate'
import escapeTextForBrowser from '@/utils/escapeTextForBrowser'
import memoizeStringOnly from '@/utils/memoizeStringOnly'

const processStyleName = memoizeStringOnly(styleName => escapeTextForBrowser(hyphenate(styleName)))

const CSSPropertyOperations = {
  createMarkupForStyles (styles) {
    let serialized = ''
    for (const styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue
      }
      const styleValue = styles[styleName]
      if (typeof styleValue !== 'undefined') {
        serialized += processStyleName(styleName) + ':'
        serialized += dangerousStyleValue(styleName, styleValue) + ';'
      }
    }
    return serialized
  },
  setValueForStyles (node, styles) {
    const style = node.style
    for (const styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue
      }
      const styleValue = styles[styleName]
      style[styleName] = dangerousStyleValue(styleName, styleValue)
    }
  },
}

export default CSSPropertyOperations
