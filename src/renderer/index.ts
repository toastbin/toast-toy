const mountElement = (vnode: ElementVnode, container: string | HTMLElement) => {
    const el = document.createElement(vnode.tag)
    const root = typeof container === 'string' ? document.querySelector(container) : container
    for (const key in vnode.props) {
        if (key.startsWith('on')) {
            // on开头，事件
            // TODO: 先这样
            el.addEventListener(key.replace('on', '').toLowerCase() as ElementEvent, vnode.props[key])
        }
    }

    if (typeof vnode.children === 'string') {
        // children 是字符串，说明是文本子节点
        el.appendChild(document.createTextNode(vnode.children))
    } else if (Array.isArray(vnode.children)) {
        vnode.children.forEach(node => {
            mountElement(node, el)
        })
    }

    // 将元素添加到挂载点下
    root.appendChild(el)
}

export { mountElement }