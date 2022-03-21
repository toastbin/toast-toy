import { shouldSetAsProps } from './domRenderOptions';
import type { VNode, ElementEvent, Container, RendererOptions, PropsType, El } from './type';
import { normalizeClass } from './utils';

export const TEXT = Symbol('text')
export const COMMENT = Symbol('comment')

/** 创建渲染器 */
export const createRenderer = (options: RendererOptions) => {
    const {
        createElement,
        setElementText,
        insert,
        patchProps,
        unmount,
        createTextNode,
        createCommentNode,
        setComment
    } = options

    /** 挂载普通元素节点 */
    const mountElement = (elementVnode: VNode, container: HTMLElement) => {
        const el = elementVnode.el = createElement(elementVnode.type) as Container

        if (typeof elementVnode.children === 'string') {
            // children 是字符串，说明是文本子节点
            setElementText(el, elementVnode.children)
        } else if (Array.isArray(elementVnode.children)) {
            // 多子节点
            elementVnode.children.forEach(child => {
                patch(null, child, el)
            })
        }

        if (elementVnode.props) {
            for (const key in elementVnode.props) {
                patchProps(el, key, null, elementVnode.props[key])
            }
        }
    
        // 将元素添加到挂载点下
        insert(el, container)
    }

    /** 比对新旧 vnode patch */
    const patch = (
        oldVnode: VNode | undefined,
        newVnode: VNode | undefined,
        container: Container
    ) => {
        if (oldVnode && oldVnode.type !== newVnode.type)  {
            unmount(oldVnode)
            // 存在，比对 vnode patch
            oldVnode = null
        }

        const { type } = newVnode

        if (typeof type === 'string') {
            if (!oldVnode) {
                mountElement(newVnode, container)
            } else {
                patchElement(oldVnode, newVnode)
            }
            // 文本节点
        } else if (type === TEXT) {
            if (!oldVnode) {
                const el = newVnode.el = createTextNode(newVnode.children as string)
                insert(el, container)
            } else {
                const el = newVnode.el = oldVnode.el
                if (oldVnode.children !== newVnode.children) {
                    setElementText(el as Container, newVnode.children as string)
                }
            }
        } else if(type === COMMENT) {
            if (!oldVnode) {
                const el = newVnode.el = createCommentNode(newVnode.children as string)
                insert(el, container)
            } else {
                const el = newVnode.el = oldVnode.el
                if (oldVnode.children !== newVnode.children) {
                    setComment(el as Comment, newVnode.children as string)
                }
            }
        } else if(typeof type === 'object') {
            // 组件 vnode
        } else {
            // 其他类型 vnode
        }

    }

    const patchElement = (oldVnode: VNode, newVnode: VNode) => {
        const el = newVnode.el = oldVnode.el
        const oldProps = oldVnode.props
        const newProps = newVnode.props

        for (const key in newProps) {
            if (newProps[key] !== oldProps[key]) {
                patchProps(el as El, key, oldProps[key], newProps[key])
            }
        }

        for (const key in oldProps) {
            if (!(key in newProps)) {
                patchProps(el as El, key, oldProps[key], null)
            }
        }

        // 更新 children
        patchChildren(oldVnode, newVnode, el as Container);
    }

    const patchChildren = (oldVnode: VNode, newVnode: VNode, container: Container) => {
        // 新子节点是文本节点
        if (typeof newVnode.children === 'string') {
            // 如果旧子节点是数组，逐一卸载
            if (Array.isArray(oldVnode.children)) {
                oldVnode.children.forEach((c) => unmount(c))
            }
            // 设置新文本节点
            setElementText(container, newVnode.children)
        // 新子节点是数组
        } else if (Array.isArray(newVnode.children)) {
            // 旧子节点也是数组
            if (Array.isArray(oldVnode.children)) {
                // 卸载旧节点
                oldVnode.children.forEach((c) => unmount(c))
            // 旧子节点不是数组
            } else {
                setElementText(container, '')
            }
            // 挂载新节点
            newVnode.children.forEach((c) => patch(null, c, container))
        // 新子节点不存在
        } else {
            // 旧子节点也是数组
            if (Array.isArray(oldVnode.children)) {
                // 卸载旧节点
                oldVnode.children.forEach((c) => unmount(c))
            // 旧子节点不是数组
            } else {
                setElementText(container, '')
            }
        }
    }

    const render = (vnode: VNode, container: Container) => {
        if (vnode) {
            // 新旧 vnode 都存在， patch
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                // 只存在旧 vnode，卸载，清空容器
                unmount(container._vnode)
            }
        }
        // 新 vnode 存起来，以便下次对比使用
        container._vnode = vnode
    }

    return {
        render
    }
}

