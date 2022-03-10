import type { ElementVnode, ElementEvent, ComponentVnode, Container, RendererOptions } from './type';

/** 创建渲染器 */
export const createRenderer = (options: RendererOptions) => {
    const {
        createElement,
        setElementText,
        insert
    } = options

    /** 挂载普通元素节点 */
    const mountElement = (elementVnode: ElementVnode, container: HTMLElement) => {
        const el = createElement(elementVnode.tag)
        for (const key in elementVnode.props) {
            if (key.startsWith('on')) {
                // on开头，事件
                // TODO: 先这样
                el.addEventListener(key.replace('on', '').toLowerCase() as ElementEvent, elementVnode.props[key])
            }
        }
    
        if (typeof elementVnode.children === 'string') {
            // children 是字符串，说明是文本子节点
            setElementText(el, elementVnode.children)
        } else if (Array.isArray(elementVnode.children)) {
            elementVnode.children.forEach(node => {
                mountElement(node, el)
            })
        }
    
        // 将元素添加到挂载点下
        insert(el, container)
    }

    /** 比对新旧 vnode patch */
    const patch = (
        oldVnode: ElementVnode | undefined,
        newVnode: ElementVnode | undefined,
        container: Container
    ) => {
        if (!oldVnode) {
            // 旧节点不存在，新建
            mountElement(newVnode, container)
        } else {
            // 存在，比对 vnode patch
        }
    }

    const render = (vnode: ElementVnode, container: Container) => {
        console.log(111)
        if (vnode) {
            // 新旧 vnode 都存在， patch
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                // 只存在旧 vnode
                container.innerHTML = ''
            }
        }
        // 新 vnode 存起来，以便下次对比使用
        container._vnode = vnode
    }

    return {
        render
    }
}

