import { injection as EventPluginHubInjection } from '@/events/EventPluginHub'
import { setComponentTree } from '@/events/EventPluginUtils'

import {
  getFiberCurrentPropsFromNode,
  getInstanceFromNode,
  getNodeFromInstance,
} from './ZzeactDOMComponentTree'
import BeforeInputEventPlugin from '../events/BeforeInputEventPlugin'
import ChangeEventPlugin from '../events/ChangeEventPlugin'
import DOMEventPluginOrder from '../events/DOMEventPluginOrder'
import EnterLeaveEventPlugin from '../events/EnterLeaveEventPlugin'
import SelectEventPlugin from '../events/SelectEventPlugin'
import SimpleEventPlugin from '../events/SimpleEventPlugin'

/**
 * Inject modules for resolving DOM hierarchy and plugin ordering.
 */
EventPluginHubInjection.injectEventPluginOrder(DOMEventPluginOrder)
setComponentTree(
  getFiberCurrentPropsFromNode,
  getInstanceFromNode,
  getNodeFromInstance,
)

/**
 * Some important event plugins included by default (without having to require
 * them).
 */
EventPluginHubInjection.injectEventPluginsByName({
  SimpleEventPlugin: SimpleEventPlugin,
  EnterLeaveEventPlugin: EnterLeaveEventPlugin,
  ChangeEventPlugin: ChangeEventPlugin,
  SelectEventPlugin: SelectEventPlugin,
  BeforeInputEventPlugin: BeforeInputEventPlugin,
})
