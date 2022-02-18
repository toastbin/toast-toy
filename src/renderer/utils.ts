import { ElementVnode, ComponentVnode } from "./type"

export const isElementVnode = (vnode: ElementVnode | ComponentVnode): vnode is ElementVnode => {
    return typeof vnode.tag === 'string'
}

export const isComponentVnode = (vnode: ElementVnode | ComponentVnode): vnode is ComponentVnode => {
    return typeof vnode.tag === 'function' || typeof vnode.tag === 'object'
}