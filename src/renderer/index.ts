import { shouldSetAsProps } from './domRenderOptions';
import type { ElementVnode, ElementEvent, Container, RendererOptions, PropsType } from './type';
import { normalizeClass } from './utils';

/** 创建渲染器 */
export const createRenderer = (options: RendererOptions) => {
    const {
        createElement,
        setElementText,
        insert,
        patchProps,
        unmount
    } = options

    /** 挂载普通元素节点 */
    const mountElement = (elementVnode: ElementVnode, container: HTMLElement) => {
        const el = elementVnode.el = createElement(elementVnode.type) as Container

        if (typeof elementVnode.children === 'string') {
            // children 是字符串，说明是文本子节点
            setElementText(el, elementVnode.children)
        } else if (Array.isArray(elementVnode.children)) {
            elementVnode.children.forEach(child => {
                // 挂载阶段
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
        oldVnode: ElementVnode | undefined,
        newVnode: ElementVnode | undefined,
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
        } else if(typeof type === 'object') {
            // 组件 vnode
        } else {
            // 其他类型 vnode
        }

    }

    const patchElement = (oldVnode: ElementVnode, newVnode: ElementVnode) => {
        const oldProps = oldVnode.props
        const newProps = newVnode.props

        if (newProps) {
            for (const key in newProps) {
                patchProps(newVnode.el, key, oldProps[key], newProps[key])
            }
        }
    }

    const render = (vnode: ElementVnode, container: Container) => {
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

