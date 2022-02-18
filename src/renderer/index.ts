import type { ElementVnode, ElementEvent, ComponentVnode } from './type';
import { isElementVnode, isComponentVnode } from './utils';

const mountElement = (elementVnode: ElementVnode, container: string | HTMLElement) => {
    const el = document.createElement(elementVnode.tag)
    const root = typeof container === 'string' ? document.querySelector(container) : container
    for (const key in elementVnode.props) {
        if (key.startsWith('on')) {
            // on开头，事件
            // TODO: 先这样
            el.addEventListener(key.replace('on', '').toLowerCase() as ElementEvent, elementVnode.props[key])
        }
    }

    if (typeof elementVnode.children === 'string') {
        // children 是字符串，说明是文本子节点
        el.appendChild(document.createTextNode(elementVnode.children))
    } else if (Array.isArray(elementVnode.children)) {
        elementVnode.children.forEach(node => {
            renderer(node, el)
        })
    }

    // 将元素添加到挂载点下
    root.appendChild(el)
}

const mountComponent = (componentVnode: ComponentVnode, container: string | HTMLElement) => {
    const subtree = typeof componentVnode.tag === 'function'
        ? componentVnode.tag()
        : componentVnode.tag.render()
    renderer(subtree, container)
}

const renderer = (vnode: ElementVnode | ComponentVnode, container: string | HTMLElement) => {
    if (isElementVnode(vnode)) {
        mountElement(vnode, container)
    } else if (isComponentVnode(vnode)) {
        mountComponent(vnode, container)
    }
}

export { mountElement, mountComponent, renderer }