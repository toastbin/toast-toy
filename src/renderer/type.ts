interface ElementVnode {
    tag: string;
    props: Record<string, any>;
    /** 文本节点 */
    children: string | ElementVnode[]
}

/** 事件 */
type ElementEvent = keyof GlobalEventHandlersEventMap
