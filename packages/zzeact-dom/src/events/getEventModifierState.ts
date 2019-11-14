import { AnyNativeEvent } from '@/events/PluginModuleType'

const modifierKeyToProp = {
  Alt: 'altKey',
  Control: 'ctrlKey',
  Meta: 'metaKey',
  Shift: 'shiftKey',
}

function modifierStateGetter(keyArg: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const syntheticEvent = this
  const nativeEvent = syntheticEvent.nativeEvent
  if (nativeEvent.getModifierState) {
    return nativeEvent.getModifierState(keyArg)
  }
  const keyProp = modifierKeyToProp[keyArg]
  return keyProp ? !!nativeEvent[keyProp] : false
}

function getEventModifierState(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nativeEvent: AnyNativeEvent,
): (keyArg: string) => boolean {
  return modifierStateGetter
}

export default getEventModifierState
