// 响应系统

// targetObj => Map<key, effectFnSet>
const bucket: WeakMap<object, Map<string | number | symbol, Dep>> = new WeakMap()
// 存储被注册的副作用函数
let activeEffect: ReactiveEffect | null = null
const effectStack: ReactiveEffect[] = []
/** 副作用函数 */
interface ReactiveEffect<T = any> {
    (): T
    deps: Dep[]
}

/** 依赖的副作用函数合集 */
type Dep = Set<ReactiveEffect>

const effect = (fn: Function): unknown => {
    const effectFn = (() => {
        // 每次执行副作用函数的时候，通过这个反向映射，把自己从已经存在的集合中删除
        cleanup(effectFn)
        // 当 effectFn 执行时，将其设置为当前执行的副作用函数
        activeEffect = effectFn
        // 先push
        effectStack.push(activeEffect)
        fn()
        // 执行完毕副作用函数后弹出
        effectStack.pop()
        // 还原
        activeEffect = effectStack[effectStack.length - 1]
    }) as ReactiveEffect

    effectFn.deps = []
    effectFn()
    return effect
}

/** proxy */
const reactivityProxy = <T extends object>(data: T): T => {
    return new Proxy(data, {
        get(target, key) {
            if (!activeEffect) return
            // 追踪依赖变化
            track(target, key)
            return target[key]
        },
        set(target, key, newVal) {
            target[key] = newVal
            trigger(target, key)
            return true
        }
    })
}

/** get 函数内调用，跟踪依赖变化 */
const track = (target: object, key: string | number | symbol) => {
    // 没有副作用函数 renturn
    if (!activeEffect) return
    // 获取当前对象的副作用函数map
    let depsMap = bucket.get(target)

    if (!depsMap) {
        // 如果没有，新建 map
        bucket.set(target, depsMap = new Map())
    }
    // 找到当前 key 的 set
    let deps = depsMap.get(key)
    if (!deps) {
        // 如果没有 针对当前 key 新建 set
        depsMap.set(key, deps = new Set())
    }
    // 收集副作用函数
    deps.add(activeEffect)
    // 对依赖集合的收集
    activeEffect.deps.push(deps)
}

/** set 函数内调用，触发副作用函数变化 */
const trigger = (target: object, key: string | number | symbol) => {
    const depsMap = bucket.get(target)

    if (!depsMap) return
    // 避免无限循环
    const effects = new Set(depsMap.get(key))
    effects && effects.forEach(fn => fn())
}

const cleanup = (effectFn: ReactiveEffect) => {
    // 删除每一个依赖集合内的副作用函数
    for (let i = 0; i < effectFn.deps.length; i++) {
        effectFn.deps[i].delete(effectFn)
    }

    effectFn.deps.length = 0
}

export { effect, reactivityProxy }
