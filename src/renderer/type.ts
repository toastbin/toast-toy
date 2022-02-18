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

/** 事件 */
export type ElementEvent = keyof GlobalEventHandlersEventMap
