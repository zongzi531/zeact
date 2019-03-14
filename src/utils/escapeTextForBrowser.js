const ESCAPE_LOOKUP = {
  '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;',
  '"': '&quot;',
  '\'': '&#x27;',
  '/': '&#x2f;'
}

const escaper = match => ESCAPE_LOOKUP[match]

const escapeTextForBrowser = text => {
  const type = typeof text
  const invalid = type === 'object'
  if (text === '' || invalid) {
    return ''
  } else {
    if (type === 'string') {
      return text.replace(/[&><"'\/]/g, escaper)
    } else {
      return ('' + text).replace(/[&><"'\/]/g, escaper)
    }
  }
}

export default escapeTextForBrowser
