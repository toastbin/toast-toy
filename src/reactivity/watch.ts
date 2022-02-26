import { effect } from './'

interface WatchOptions {
    immediate?: boolean
    // TODO pre 
    flush?: 'post' | 'pre' | 'sync'
    // TODO deep
    deep?: boolean
}

const watch = (source: any, callback: (oldVal, newVal) => any, watchOptions: WatchOptions = {}) => {
    let getter: () => unknown
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    // 旧值 新值
    let oldVal, newVal

    const job = () => {
        newVal = effectFn()
        callback(oldVal, newVal)
        oldVal = newVal
    }

    const effectFn = effect(getter, {
        lazy: true,
        scheduler: () => {
            // flush: post 异步延迟执行
            if (watchOptions.flush === 'post') {
                Promise.resolve().then(job)
            } else {
                job()
            }
        }
    })

    if (watchOptions.immediate) {
        job()
    } else {
        oldVal = effectFn()
    }
}

/** 读取 proxy 内的每一个数据，建立所有数据的响应关系 */
const traverse = (value: any, seen = new Set()) => {
    // 如果要读取的数据是原始值，或者已经被读取过，return
    if (typeof value !== 'object' || value === null || seen.has(value)) return
    // 数据添加到 seen 中
    seen.add(value)
    // TODO:暂时不考虑数组等
    // 假设目前 value 只是对象
    for (const k in value) {
        traverse(value[k], seen)
    }

    return value
}

export { watch }
