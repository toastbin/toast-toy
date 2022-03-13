export interface ElementVnode {
    tag: string;
    // TODO on打头的推倒为方法
    props?: Record<string, string | boolean | (() => any)>
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
    createElement: (tag: string) => HTMLElement
    setElementText: (el: HTMLElement, text: string) => void
    insert: (el: HTMLElement, container: HTMLElement) => void
    setEvent: (el: HTMLElement, eventName: ElementEvent, listener: (this: HTMLElement, ev: HTMLElementEventMap[keyof HTMLElementEventMap]) => any, options?: boolean | AddEventListenerOptions) => any
    patchProps: (el: HTMLElement, attributeName: string, value: string | boolean | (() => any)) => void
}
