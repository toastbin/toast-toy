import { reactiveProxy } from './'

/** 证明当前属性是 ref 的标识 */
const __IS__REF__ = '__IS__REF__'
// TODO: 体操
interface Ref<T = any> {
    value: T
}

export const ref = <T = any>(value: T): Ref<T> => {
    // 在 ref 函数内创建包裹对象
    const wrapper = {
        value,
    }

    Object.defineProperty(wrapper, __IS__REF__, {
        value: true,
    })

    return reactiveProxy(wrapper)
}

export const toRef = <T extends object, K extends keyof T>(obj: T, key: K): Ref<T[K]> => {
    const wrapper = {
        // @ts-ignore
        get value() {
            return obj[key]
        },
        // @ts-ignore
        set value(value) {
            obj[key] = value
        }
    }

    Object.defineProperty(wrapper, __IS__REF__, {
        value: true,
    })

    return wrapper
}

export const toRefs = <T extends object, K extends keyof T>(obj: T): Record<K, Ref> => {
    const res: any = {}
    for (const key in obj) {
        res[key] = toRef(obj, key)
    }

    return res
}
