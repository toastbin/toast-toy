// 响应系统
const bucket: Set<Function> = new Set()
// 存储被注册的副作用函数
let activeEffect: Function | null = null
const effect = (fn: Function) => {
    activeEffect = fn
    fn()
}

const reactivityProxy = <T extends object>(data: T): T => {
    new Proxy(data, {
        get(target, key) {
            if (activeEffect) {
                bucket.add(activeEffect)
            }
            return target[key]
        },
        set(target, key, newVal) {
            bucket.forEach(fn => fn())
            target[key] = newVal
            return true
        }
    })
    
    return data
}

export { effect, reactivityProxy }
