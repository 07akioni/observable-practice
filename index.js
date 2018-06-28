const onix = {}

onix._currentRunningFunction = null
onix._callbackQueue = []
onix._runQueue = (function () {
  func2run = new WeakSet(this._callbackQueue)
  func2run.forEach(func => {
    func()
  })
}).bind(onix)
onix.autoRun = (function (func) {
  onix._currentRunningFunction = func
  func()
  onix._currentRunningFunction = null
}).bind(onix)
const _observableSet = new WeakSet()

onix.Observable = class Observable {
  _callbackMap = new WeakMap()
  constructor (obj) {
    if (_observableSet.has(obj)) return obj
    else {
      const ownPropertyNames = Object.getOwnPropertyNames(obj)
      ownPropertyNames.forEach(key => {
        this._callbackMap.set(key, new WeakSet())
      })
      const callbackMap = this._callbackMap
      const proxyObj = new Proxy(obj, {
        get (target, p, receiver) {
          if (typeof onix._currentRunningFunction === 'function') {
            callbackMap.get(p).add(onix._currentRunningFunction)
          }
          return target[p]
        },
        set (target, p, value, receiver) {
          onix._callbackQueue = onix._callbackQueue.concat(Array.from(callbackMap.get(p)))
          target[p] = value
        }
      })
      return proxyObj
    }
  }
}