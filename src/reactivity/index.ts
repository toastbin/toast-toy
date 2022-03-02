// 响应系统

// targetObj => Map<key, effectFnSet>
const bucket: WeakMap<object, Map<string | number | symbol, Dep>> = new WeakMap()
// 存储被注册的副作用函数
let activeEffect: ReactiveEffect | null = null
const effectStack: ReactiveEffect[] = []
const ITERATE_KEY = Symbol()

export const triggerType = {
    SET: 'SET',
    ADD: 'ADD',
    DELETE: 'DELETE'
} as const

/** 响应式数据通过该属性访问原始数据 */
const __RAW__ = '__RAW__'

/** 存储原始对象到代理对象的映射 */
const reactiveMap = new Map()

/** 副作用函数 */
export interface ReactiveEffect<T = any> {
    (): T
    deps: Dep[]
    options: ReactiveEffectOptions
}

/** 依赖的副作用函数合集 */
type Dep = Set<ReactiveEffect>
/** 副作用函数 options */
interface ReactiveEffectOptions {
    scheduler?: (job: ReactiveEffect) => void
    lazy?: boolean
}

interface ReactiveOptionsOptions {
    shallow?: boolean
    readonly?: boolean;
}


const arrayInstrumentations = {}

;['includes', 'indexOf', 'lastIndexOf'].forEach(arrMethod => {
    const originArrMethod = Array.prototype[arrMethod]
    arrayInstrumentations[arrMethod] = function(...args: any[]) {
        let res = originArrMethod.apply(this, args)
        if (res === false) {
            // false 说明没找到，通过 __raw__ 拿原始值再去找一遍
            res = originArrMethod.apply(this.__RAW__, args)
        }
        return res
    }
})

const effect = <T = any>(fn: () => T, options: ReactiveEffectOptions = {}): ReactiveEffect<T> => {
    const effectFn = (() => {
        // 每次执行副作用函数的时候，通过这个反向映射，把自己从已经存在的集合中删除
        cleanup(effectFn)
        // 当 effectFn 执行时，将其设置为当前执行的副作用函数
        activeEffect = effectFn
        // 先push
        effectStack.push(activeEffect)
        const res = fn()
        // 执行完毕副作用函数后弹出
        effectStack.pop()
        // 还原
        activeEffect = effectStack[effectStack.length - 1]

        return res
    }) as ReactiveEffect

    // options 挂到 effectFn 上
    effectFn.options = options
    effectFn.deps = []
    // 非 lazy 才直接执行
    if (!options.lazy) {
        effectFn()
    }
    return effectFn
}

/** 浅 reactive */
const reactiveProxy = <T extends object>(data: T, options: ReactiveOptionsOptions = {}): T => {
    const { shallow = false, readonly = false } = options
    const existProxy = reactiveMap.get(data)
    if (existProxy) return existProxy
    const proxy = new Proxy(data, {
        // receiver 总是指向原始的读操作所在的那个对象
        get(target, key, receiver) {
            // 通过 raw 属性访问原始数据
            if (key === __RAW__) return target

            // 如果 target 是数组 且 当前操作的是需要改写的方法
            if (Array.isArray(target) && Object.prototype.hasOwnProperty.call(arrayInstrumentations, key)) {
                return Reflect.get(arrayInstrumentations, key, receiver)
            }

            // 只读属性不需要建立副作用函数
            // TODO:避免追踪 Symbol.iterator，但是并没有去追踪该属性
            if (!readonly && typeof key !== 'symbol') {
                // 追踪依赖变化
                track(target, key)
            }
            const getRes = Reflect.get(target, key, receiver)
            if (!shallow && typeof getRes === 'object' && getRes !== null) {
                return reactiveProxy(getRes, options)
            }

            return getRes
        },
        has(targrt, key) {
            return Reflect.has(targrt, key)
        },
        set(target, key, newVal, receiver) {
            // 只读属性拦截 set
            if (readonly) {
                console.warn(`property ${String(key)} is readonly`)
                return true
            }

            const oldVal = target[key]
            const type = Array.isArray(target)
                // target 是数组
                // 如果设置的索引值大于原数组长度，新增操作
                ? Number(key) < target.length ? triggerType.SET : triggerType.ADD
                : Object.prototype.hasOwnProperty.call(target, key)
                    ? triggerType.SET
                    : triggerType.ADD

            const setRes = Reflect.set(target, key, newVal, receiver)

            // target 等于 __RAW__ 下面的原属数据，说明当前 receiver 就是 target 的代理对象
            if (target === receiver[__RAW__]) {
                // 更新的值不一样时才触发副作用函数，保证不是 NaN
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    trigger(target, key, type, newVal)
                }
            }

            return setRes
        },
        // 拦截 for in 操作
        ownKeys(target) {
            track(target, Array.isArray ? 'length' : ITERATE_KEY)
            return Reflect.ownKeys(target)
        },
        // 拦截 delete
        deleteProperty(target, key) {
            // 只读属性拦截 delete
            if (readonly) {
                console.warn(`property ${String(key)} is readonly`)
                return true
            }

            const hasKey = Object.prototype.hasOwnProperty.call(target, key)
            const deleteRes = Reflect.deleteProperty(target, key)
            if (hasKey && deleteRes) {
                trigger(target, key, triggerType.DELETE)
            }
            return deleteRes
        }
    })
    
    reactiveMap.set(data, proxy)

    return proxy
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
const trigger = (
    target: object,
    key: string | number | symbol,
    type: keyof typeof triggerType,
    newVal?: any
) => {
    const depsMap = bucket.get(target)

    if (!depsMap) return
    // 避免无限循环
    const effects = new Set(depsMap.get(key))

    const effectsToRun: Set<ReactiveEffect> = new Set()
    effects && effects.forEach(fn => {
        // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不执行
        if (fn !== activeEffect) {
            effectsToRun.add(fn)
        }
    })

    // 操作数组 length
    if (type === 'ADD' && Array.isArray(target)) {
        const lengthEffects = depsMap.get('length')
        lengthEffects && lengthEffects.forEach(fn => {
            if (fn !== activeEffect) {
                effectsToRun.add(fn)
            }
        })
    }

    if (Array.isArray(target) && key === 'length') {
        depsMap.forEach((effects, key) => {
            if (Number(key) >= newVal) {
                effects.forEach(effectFn => {
                    if (effectFn !== activeEffect) {
                        effectsToRun.add(effectFn)
                    }
                })
            }
        })
    }

    if (type === 'ADD' || type === 'DELETE') {
        const iterateEffects = depsMap.get(ITERATE_KEY)
        // 添加 ITERATE_KEY 相关联的副作用函数
        iterateEffects && iterateEffects.forEach(fn => {
            if (fn !== activeEffect) {
                effectsToRun.add(fn)
            }
        })
    }

    effectsToRun.forEach(effectFn => {
        // 如果用户传入的 scheduler 函数
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

const cleanup = (effectFn: ReactiveEffect) => {
    // 删除每一个依赖集合内的副作用函数
    for (let i = 0; i < effectFn.deps.length; i++) {
        effectFn.deps[i].delete(effectFn)
    }

    effectFn.deps.length = 0
}

export { effect, reactiveProxy, trigger, track }
