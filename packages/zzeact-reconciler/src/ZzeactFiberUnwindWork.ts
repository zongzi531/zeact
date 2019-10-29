import { Fiber } from './ZzeactFiber'

import {
  ClassComponent,
  HostRoot,
  HostComponent,
  HostPortal,
  ContextProvider,
  // SuspenseComponent,
  // DehydratedSuspenseComponent,
  // IncompleteClassComponent,
} from '@/shared/ZzeactWorkTags'

import { popHostContainer, popHostContext } from './ZzeactFiberHostContext'
import {
  // isContextProvider as isLegacyContextProvider,
  popContext as popLegacyContext,
  popTopLevelContextObject as popTopLevelLegacyContextObject,
} from './ZzeactFiberContext'
import { popProvider } from './ZzeactFiberNewContext'

function unwindInterruptedWork(interruptedWork: Fiber): void {
  switch (interruptedWork.tag) {
    case ClassComponent: {
      const childContextTypes = interruptedWork.type.childContextTypes
      if (childContextTypes !== null && childContextTypes !== undefined) {
        popLegacyContext(/* interruptedWork */)
      }
      break
    }
    case HostRoot: {
      popHostContainer(/* interruptedWork */)
      popTopLevelLegacyContextObject(/* interruptedWork */)
      break
    }
    case HostComponent: {
      popHostContext(interruptedWork)
      break
    }
    case HostPortal:
      popHostContainer(/* interruptedWork */)
      break
    case ContextProvider:
      popProvider(interruptedWork)
      break
    default:
      break
  }
}

export {
  // throwException,
  // unwindWork,
  unwindInterruptedWork,
  // createRootErrorUpdate,
  // createClassErrorUpdate,
}