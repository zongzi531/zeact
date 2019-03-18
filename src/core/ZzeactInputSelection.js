const getActiveElement = () => {
  try {
    return document.activeElement
  } catch (e) {}
}

const ZzeactInputSelection = {
  hasSelectionCapabilities (elem) {
    return elem && (
      (elem.nodeName === 'INPUT' && elem.type === 'text') ||
      elem.nodeName === 'TEXTAREA' ||
      elem.contentEditable === 'true'
    )
  },
  getSelectionInformation () {
    const focusedElem = getActiveElement()
    return {
      focusedElem,
      selectionRange:
        ZzeactInputSelection.hasSelectionCapabilities(focusedElem)
          ? ZzeactInputSelection.getSelection(focusedElem)
          : null,
    }
  },
  restoreSelection (priorSelectionInformation) {
    const curFocusedElem = getActiveElement()
    const priorFocusedElem = priorSelectionInformation.focusedElem
    const priorSelectionRange = priorSelectionInformation.selectionRange
    if (curFocusedElem !== priorFocusedElem &&
      document.getElementById(priorFocusedElem.id)) {
      if (ZzeactInputSelection.hasSelectionCapabilities(priorFocusedElem)) {
        ZzeactInputSelection.setSelection(
          priorFocusedElem,
          priorSelectionRange
        )
      }
      priorFocusedElem.focus()
    }
  },
  getSelection (input) {
    let range
    if (input.contentEditable === 'true' && window.getSelection) {
      range = window.getSelection().getRangeAt(0)
      var commonAncestor = range.commonAncestorContainer
      if (commonAncestor && commonAncestor.nodeType === 3) {
        commonAncestor = commonAncestor.parentNode
      }
      if (commonAncestor !== input) {
        return { start: 0, end: 0 }
      } else {
        return { start: range.startOffset, end: range.endOffset }
      }
    }

    if (!document.selection) {
      // Mozilla, Safari, etc.
      return { start: input.selectionStart, end: input.selectionEnd }
    }

    range = document.selection.createRange()
    if (range.parentElement() !== input) {
      // There can only be one selection per document in IE, so if the
      // containing element of the document's selection isn't our text field,
      // our text field must have no selection.
      return { start: 0, end: 0 }
    }

    var length = input.value.length

    if (input.nodeName === 'INPUT') {
      return {
        start: -range.moveStart('character', -length),
        end: -range.moveEnd('character', -length),
      }
    } else {
      var range2 = range.duplicate()
      range2.moveToElementText(input)
      range2.setEndPoint('StartToEnd', range)
      var end = length - range2.text.length
      range2.setEndPoint('StartToStart', range)
      return {
        start: length - range2.text.length,
        end,
      }
    }
  },
  setSelection (input, rangeObj) {
    let range
    let start = rangeObj.start
    let end = rangeObj.end
    if (typeof end === 'undefined') {
      end = start
    }
    if (document.selection) {
      // IE is inconsistent about character offsets when it comes to carriage
      // returns, so we need to manually take them into account
      if (input.tagName === 'TEXTAREA') {
        var crBefore =
          (input.value.slice(0, start).match(/\r/g) || []).length
        var crInside =
          (input.value.slice(start, end).match(/\r/g) || []).length
        start -= crBefore
        end -= crBefore + crInside
      }
      range = input.createTextRange()
      range.collapse(true)
      range.moveStart('character', start)
      range.moveEnd('character', end - start)
      range.select()
    } else {
      if (input.contentEditable === 'true') {
        if (input.childNodes.length === 1) {
          range = document.createRange()
          range.setStart(input.childNodes[0], start)
          range.setEnd(input.childNodes[0], end)
          var sel = window.getSelection()
          sel.removeAllRanges()
          sel.addRange(range)
        }
      } else {
        input.selectionStart = start
        input.selectionEnd = Math.min(end, input.value.length)
        input.focus()
      }
    }
  },
}

export default ZzeactInputSelection
