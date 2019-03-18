import ZzeactInstanceHandles from './ZzeactInstanceHandles'

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

const ZzeactMount = {
  totalInstantiationTime: 0,
  totalInjectionTime: 0,
  renderComponent: (nextComponent, container) => {
    const prevComponent = instanceByZzeactRootID[getZzeactRootID(container)]
    if (prevComponent) {
      // 这里的逻辑暂时不写
      console.log(prevComponent)
    }
    const zzeactRootID = ZzeactMount.registerContainer(container)
    instanceByZzeactRootID[zzeactRootID] = nextComponent
    nextComponent.mountComponentIntoNode(zzeactRootID, container)
    return nextComponent
  },
  registerContainer: (container) => {
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
}

export default ZzeactMount
