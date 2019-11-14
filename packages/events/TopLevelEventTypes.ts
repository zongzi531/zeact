export type ZNTopLevelEventType =
  | 'topMouseDown'
  | 'topMouseMove'
  | 'topMouseUp'
  | 'topScroll'
  | 'topSelectionChange'
  | 'topTouchCancel'
  | 'topTouchEnd'
  | 'topTouchMove'
  | 'topTouchStart'

export /* opaque */ type DOMTopLevelEventType = string

export function unsafeCastStringToDOMTopLevelType(
  topLevelType: string,
): DOMTopLevelEventType {
  return topLevelType
}

export function unsafeCastDOMTopLevelTypeToString(
  topLevelType: DOMTopLevelEventType,
): string {
  return topLevelType
}

export type TopLevelType = DOMTopLevelEventType | ZNTopLevelEventType
