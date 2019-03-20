const listenerBank = {}

const CallbackRegistry = {
  putListener (id, registrationName, listener) {
    // 要写这里了
    const bankForRegistrationName = listenerBank[registrationName] || (listenerBank[registrationName] = {})
    bankForRegistrationName[id] = listener
  },
  getListener (id, registrationName) {
    // 看起来是在 putListener 时，我会将对应的 listener 存入 listenerBank
    // 并且执行？或是监听
    // 获得对应事件下对应 id 的 listener
    const bankForRegistrationName = listenerBank[registrationName]
    return bankForRegistrationName && bankForRegistrationName[id]
  },
}

export default CallbackRegistry
