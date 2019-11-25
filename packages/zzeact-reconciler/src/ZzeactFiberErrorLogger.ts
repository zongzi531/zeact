import { CapturedError } from './ZzeactCapturedValue'

import { showErrorDialog } from './ZzeactFiberErrorDialog'

export function logCapturedError(capturedError: CapturedError): void {
  const logError = showErrorDialog(capturedError)

  if (logError === false) {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (capturedError.error as any)
  console.error(error)
}
