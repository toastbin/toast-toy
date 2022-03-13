export interface ElementVnode {
    tag: string;
    // TODO on打头的推倒为方法
    props?: Record<string, string | (() => any) | boolean | Record<string, boolean> | (string | Record<string, boolean>)[]>
    /** 文本节点 or vnode */
    children: string | ElementVnode[] | ComponentVnode[]
}

type RenderFunc = () => ElementVnode

export interface ComponentVnode {
    tag: RenderFunc | {
        render: RenderFunc
    };
}

export type Container = HTMLElement & {
    _vnode: ElementVnode
}

/** 事件 */
export type ElementEvent = keyof GlobalEventHandlersEventMap

/** 渲染器选项 */
export interface RendererOptions {
    createElement: (tag: string) => Element
    setElementText: (el: Element, text: string) => void
    insert: (el: Element, container: Element) => void
    setEvent: (el: Element, eventName: ElementEvent, listener: (this: Element, ev: HTMLElementEventMap[keyof HTMLElementEventMap]) => any, options?: boolean | AddEventListenerOptions) => any
    patchProps: (el: Element, attributeName: string, value: string | boolean | (() => any) | Record<string, boolean> | (string | Record<string, boolean>)[]) => void
}
