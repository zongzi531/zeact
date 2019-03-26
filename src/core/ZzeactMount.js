import ZzeactInstanceHandles from './ZzeactInstanceHandles'
import ZzeactEvent from './ZzeactEvent'
import ZzeactEventTopLevelCallback from './ZzeactEventTopLevelCallback'
import $ from '@/vendor/core/$'

/**
 * 总共的挂在数量
 */
let globalMountPointCounter = 0

/**
 * 根据 `zzeactRootID[*]` 来存放的实例集合
 */
const instanceByZzeactRootID = {}

/**
 * 根据 `zzeactRootID[*]` 来存放的 `containers` 集合
 */
const containersByZzeactRootID = {}

const getZzeactRootID = (container) => {
  return container.firstChild && container.firstChild.id
}

/**
 * Mounting is the process of initializing a React component by creatings its
 * representative DOM elements and inserting them into a supplied `container`.
 * Any prior content inside `container` is destroyed in the process.
 *
 *   ReactMount.renderComponent(component, $('container'));
 *
 *   <div id="container">         <-- Supplied `container`.
 *     <div id=".reactRoot[3]">   <-- Rendered reactRoot of React component.
 *       // ...
 *     </div>
 *   </div>
 *
 * Inside of `container`, the first element rendered is the "reactRoot".
 */
const ZzeactMount = {
  totalInstantiationTime: 0,
  totalInjectionTime: 0,
  useTouchEvents: false,
  scrollMonitor (container, renderCallback) {
    renderCallback()
  },
  prepareTopLevelEvents (TopLevelCallbackCreator) {
    // 是否使用 useTouchEvents 的标记
    ZzeactEvent.ensureListening(ZzeactMount.useTouchEvents, TopLevelCallbackCreator)
  },
  renderComponent (nextComponent, container) {
    // 获取之前的组件
    const prevComponent = instanceByZzeactRootID[getZzeactRootID(container)]
    if (prevComponent) {
      if (prevComponent.constructor === nextComponent.constructor) {
        // 新的 props
        const nextProps = nextComponent.props
        ZzeactMount.scrollMonitor(container, () => {
          // 之前的组件更新 props
          prevComponent.replaceProps(nextProps)
        })
        // 返回之前的组件
        return prevComponent
      } else {
        // 卸载之前的组件
        ZzeactMount.unmountAndReleaseZzeactRootNode(container)
      }
    }

    // 注册事件
    ZzeactMount.prepareTopLevelEvents(ZzeactEventTopLevelCallback)

    // 注册 ID
    const zzeactRootID = ZzeactMount.registerContainer(container)
    // cache ID
    instanceByZzeactRootID[zzeactRootID] = nextComponent
    // 挂载新组件
    nextComponent.mountComponentIntoNode(zzeactRootID, container)
    // 返回新组件
    return nextComponent
  },
  createComponentRenderer (component) {
    return function (container) {
      return ZzeactMount.renderComponent(component, container)
    }
  },
  constructAndRenderComponent (constructor, props, container) {
    return ZzeactMount.renderComponent(constructor(props), container)
  },
  constructAndRenderComponentByID (constructor, props, id) {
    return ZzeactMount.constructAndRenderComponent(constructor, props, $(id))
  },
  registerContainer (container) {
    let zzeactRootID = getZzeactRootID(container)
    // 这一块逻辑暂时还没有遇到，先写好
    // 这个方法功能OK
    if (zzeactRootID) {
      zzeactRootID = ZzeactInstanceHandles.getZzeactRootIDFromNodeID(zzeactRootID)
    }
    if (!zzeactRootID) {
      zzeactRootID = ZzeactInstanceHandles.getZzeactRootID(globalMountPointCounter++)
    }
    containersByZzeactRootID[zzeactRootID] = container
    return zzeactRootID
  },
  unmountAndReleaseZzeactRootNode (container) {
    // 获得 ID
    const zzeactRootID = getZzeactRootID(container)
    // 获得 cache 组件
    const component = instanceByZzeactRootID[zzeactRootID]
    // 卸载组件
    component.unmountComponentFromNode(container)
    // 释放内存
    delete instanceByZzeactRootID[zzeactRootID]
    // 释放内存
    delete containersByZzeactRootID[zzeactRootID]
  },
  findZzeactContainerForID (id) {
    const zzeatRootID = ZzeactInstanceHandles.getZzeactRootIDFromNodeID(id)
    // TODO: Consider throwing if `id` is not a valid React element ID.
    return containersByZzeactRootID[zzeatRootID]
  },
  findZzeactRenderedDOMNodeSlow (id) {
    const zzeactRoot = ZzeactMount.findZzeactContainerForID(id)
    return ZzeactInstanceHandles.findComponentRoot(zzeactRoot, id)
  },
}

export default ZzeactMount
