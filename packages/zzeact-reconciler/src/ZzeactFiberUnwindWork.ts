import {
  ClassComponent,
  ContextProvider,
  DehydratedSuspenseComponent,
  HostComponent,
  HostPortal,
  HostRoot,
  IncompleteClassComponent,
  SuspenseComponent,
} from '@/shared/ZzeactWorkTags'
import { IFiber } from './ZzeactFiber'
import {
  popContext as popLegacyContext,
  popTopLevelContextObject as popTopLevelLegacyContextObject,
} from './ZzeactFiberContext'
import { popHostContainer, popHostContext } from './ZzeactFiberHostContext'
import { popProvider } from './ZzeactFiberNewContext'

function unwindInterruptedWork(interruptedWork: IFiber) {
  switch (interruptedWork.tag) {
    case ClassComponent: {
      const childContextTypes = interruptedWork.type.childContextTypes
      if (childContextTypes !== null && childContextTypes !== undefined) {
        popLegacyContext(interruptedWork)
      }
      break
    }
    case HostRoot: {
      popHostContainer(interruptedWork)
      popTopLevelLegacyContextObject(interruptedWork)
      break
    }
    case HostComponent: {
      popHostContext(interruptedWork)
      break
    }
    case HostPortal:
      popHostContainer(interruptedWork)
      break
    case ContextProvider:
      popProvider(interruptedWork)
      break
    default:
      break
  }
}

export {
  unwindInterruptedWork,
}
