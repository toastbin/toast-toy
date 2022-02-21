// 响应系统

// targetObj => Map<key, effectFnSet>
const bucket: WeakMap<object, Map<string | number | symbol, Set<Function>>> = new WeakMap()
// 存储被注册的副作用函数
let activeEffect: Function | null = null
const effect = (fn: Function) => {
    activeEffect = fn
    fn()
}

const reactivityProxy = <T extends object>(data: T): T => {
    new Proxy(data, {
        get(target, key) {
            if (!activeEffect) return

            const depsMap = bucket.get(target)

            if (!depsMap) {
                depsMap.set(key, new Set())
            }

            const deps = depsMap.get(key)
            deps.add(activeEffect)

            return target[key]
        },
        set(target, key, newVal) {
            target[key] = newVal
            const depsMap = bucket.get(target)
            
            if (!depsMap) return
            const effects = depsMap.get(key)
            effects && effects.forEach(fn => fn())
            return true
        }
    })
    
    return data
}

export { effect, reactivityProxy }
