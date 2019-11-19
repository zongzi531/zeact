import { shorthandToLonghand } from './CSSShorthandProperty'

import dangerousStyleValue from './dangerousStyleValue'
import warning from '@/shared/warning'

export function createDangerousStringForStyles(): void { return }

export function setValueForStyles(node, styles): void {
  const style = node.style
  for (let styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue
    }
    const isCustomProperty = styleName.indexOf('--') === 0
    const styleValue = dangerousStyleValue(
      styleName,
      styles[styleName],
      isCustomProperty,
    )
    if (styleName === 'float') {
      styleName = 'cssFloat'
    }
    if (isCustomProperty) {
      style.setProperty(styleName, styleValue)
    } else {
      style[styleName] = styleValue
    }
  }
}

function isValueEmpty(value): boolean {
  return value == null || typeof value === 'boolean' || value === ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expandShorthandMap(styles): any {
  const expanded = {}
  for (const key in styles) {
    const longhands = shorthandToLonghand[key] || [key]
    for (let i = 0; i < longhands.length; i++) {
      expanded[longhands[i]] = key
    }
  }
  return expanded
}

export function validateShorthandPropertyCollisionInDev(
  styleUpdates,
  nextStyles,
): void {
  if (!nextStyles) {
    return
  }

  const expandedUpdates = expandShorthandMap(styleUpdates)
  const expandedStyles = expandShorthandMap(nextStyles)
  const warnedAbout = {}
  for (const key in expandedUpdates) {
    const originalKey = expandedUpdates[key]
    const correctOriginalKey = expandedStyles[key]
    if (correctOriginalKey && originalKey !== correctOriginalKey) {
      const warningKey = originalKey + ',' + correctOriginalKey
      if (warnedAbout[warningKey]) {
        continue
      }
      warnedAbout[warningKey] = true
      warning(
        false,
        '%s a style property during rerender (%s) when a ' +
          'conflicting property is set (%s) can lead to styling bugs. To ' +
          'avoid this, don\'t mix shorthand and non-shorthand properties ' +
          'for the same value; instead, replace the shorthand with ' +
          'separate values.',
        isValueEmpty(styleUpdates[originalKey]) ? 'Removing' : 'Updating',
        originalKey,
        correctOriginalKey,
      )
    }
  }
}
