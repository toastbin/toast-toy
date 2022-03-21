import { VNode, ComponentVnode } from "./type"

export const isElementVnode = (vnode: VNode | ComponentVnode): vnode is VNode => {
    return typeof vnode.type === 'string'
}

export const isComponentVnode = (vnode: VNode | ComponentVnode): vnode is ComponentVnode => {
    return typeof vnode.type === 'function' || typeof vnode.type === 'object'
}

const transClassProps = (classProps: string | Record<string, boolean>): string => {
    if (typeof classProps == 'string') {
        return ` ${classProps}`
    } else {
        return Object.keys(classProps).reduce((acc, cur) => {
            if (classProps[cur]) {
                acc += ` ${cur}`
            }
            return acc
        }, '')
    }
}
/** 格式化 class */
export const normalizeClass = (classProps: string | Record<string, boolean> | (string | Record<string, boolean>)[]): string => {
    if (Array.isArray(classProps)) {
        return classProps.reduce((acc, cur) => {
            acc += transClassProps(cur)
            return acc
        }, '') as string
    } else {
        return transClassProps(classProps)
    }
}
