import { COMMENT, TEXT } from ".";
type VNodeTypes =
    | string
    | typeof TEXT
    | typeof COMMENT
export interface ElementVnode {
    type: VNodeTypes;
    // TODO on打头的推倒为方法
    props?: Record<string, string | (() => any) | boolean | Record<string, boolean> | (string | Record<string, boolean>)[]>
    /** 文本节点 or vnode */
    children: string | ElementVnode[] | ComponentVnode[] | null
    el?: Container | Text
}

type RenderFunc = () => ElementVnode

export interface ComponentVnode {
    type: RenderFunc | {
        render: RenderFunc
    };
}

export type Container = HTMLElement & {
    /** 缓存的  vnode */
    _vnode: ElementVnode
    /** 事件处理 map */
    _event_invoker_map?: Record<string, {
        wrapper?: (ev: HTMLElementEventMap[keyof HTMLElementEventMap]) => any,
        realInvoker?: Function | Function[],
        attched?: number
    }> | null
}

export type El = Omit<Container, '_vnode'>
/** 事件 */
export type ElementEvent = keyof GlobalEventHandlersEventMap

/** 渲染器选项 */
export interface RendererOptions {
    createElement: (tag: ElementVnode['type']) => Element
    setElementText: (Container: El, text: string) => void
    insert: (el: Container | Text, container: El) => void
    setEvent: (el: El, eventName: ElementEvent, listener: (ev: HTMLElementEventMap[keyof HTMLElementEventMap]) => any, options?: boolean | AddEventListenerOptions) => any
    patchProps: (el: El, name: string, preValue: PropsType | null, newValue: PropsType) => any
    unmount: (vnode: ElementVnode) => void
    createTextNode: (text: string) => Text
}

export type PropsType = string | boolean | (() => any) | Record<string, boolean> | (string | Record<string, boolean>)[]
