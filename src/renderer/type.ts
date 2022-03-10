export interface ElementVnode {
    tag: string;
    props: Record<string, any>;
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
}
