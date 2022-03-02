import { effect, track, trigger, triggerType } from './'

interface ComputedOptions {
    get: () => any
    set: () => any
}

type ComputedGetter = (ctx?: unknown) => any

const computed = (getter: ComputedGetter) => {
    // 缓存上一次计算的值
    let val
    // 是否需要重新计算
    let dirty: boolean = true

    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            dirty = true
            // 当计算属性依赖的响应式数据发生变化，手动调用 trigger 触发响应
            trigger(obj, 'value', triggerType.SET)
        }
    })

    const obj = {
        // (!) Plugin typescript: @rollup/plugin-typescript TS1056: Accessors are only available when targeting ECMAScript 5 and higher.
        // @ts-ignore 先忽略
        get value() {
            // 重新计算
            if (dirty) {
                val = effectFn()
                dirty = false
            }
            // 当计算属性依赖的响应式数据发生变化，手动调用 track 进行追踪
            track(obj, 'value')
            return val
        }
    }

    return obj
}

export { computed }