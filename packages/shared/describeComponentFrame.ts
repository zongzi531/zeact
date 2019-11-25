const BEFORE_SLASH_RE = /^(.*)[\\\/]/

export default function(
  name: null | string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any,
  ownerName: null | string,
): string {
  let sourceInfo = ''
  if (source) {
    const path = source.fileName
    const fileName = path.replace(BEFORE_SLASH_RE, '')
    sourceInfo = ' (at ' + fileName + ':' + source.lineNumber + ')'
  } else if (ownerName) {
    sourceInfo = ' (created by ' + ownerName + ')'
  }
  return '\n    in ' + (name || 'Unknown') + sourceInfo
}
