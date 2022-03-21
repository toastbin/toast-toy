import { ElementEvent, RendererOptions } from "./type";
import { normalizeClass } from "./utils";

export const shouldSetAsProps = (el: Element, key: string) => {
    if (key === 'form' && el.tagName === 'INPUT') return false;
    return key in el;
}

export const domRenderOptions: RendererOptions = {
    createElement(tag) {
        return document.createElement(tag as string)
    },
    setElementText(el, text) {
        el.appendChild(document.createTextNode(text))
    },
    insert(el, container) {
        container.appendChild(el)
    },
    setEvent(el, eventName, listener, options) {
        el.addEventListener(eventName, listener, options)
    },
    patchProps (el, key, preValue, newValue) {
        if (key.startsWith('on')) {
            if (typeof newValue === 'function') {
                const eventMap = el._event_invoker_map || (el._event_invoker_map = {})
                let currentInvoker = eventMap[key] || (eventMap[key] = {})
                const name = key.replace('on', '').toLowerCase() as ElementEvent
                if (newValue) {
                    if (!Object.keys(currentInvoker).length) {
                        currentInvoker.wrapper = eventMap[key].wrapper = (e) => {
                            // 事件发生的时间早于绑定的时间 不执行
                            if (e.timeStamp < currentInvoker.attched) return
                            if (Array.isArray(currentInvoker.realInvoker)) {
                                currentInvoker.realInvoker.forEach((fn) => fn(e))
                            }  else {
                                currentInvoker.realInvoker(e)
                            }
                        }
                    }
                    currentInvoker.realInvoker = newValue
                    currentInvoker.attched = performance.now()
                    domRenderOptions.setEvent(el, name, currentInvoker.wrapper)
                } else if (currentInvoker) {
                    el.removeEventListener(name, currentInvoker.wrapper)
                }
            }
        } else if (key === 'class') {
            if (typeof newValue === 'string' || typeof newValue == 'object') {
                el.className = normalizeClass(newValue)
            }
        } else {
            // 属性名存在于 DOM properties 中
            if (shouldSetAsProps(el, key)) {
                if (typeof el[key] === 'boolean' && newValue === '') {
                    el[key] = true
                } else {
                    el[key] = newValue
                }
            } else {
                el.setAttribute(key, String(newValue))
            }
        }
    },
    unmount(vnode) {
        const parent = vnode.el.parentNode
        if (parent) {
            parent.removeChild(vnode.el)
        }
    },
    createTextNode(text) {
        return document.createTextNode(text)
    },
    createCommentNode(comment) {
        return document.createComment(comment)
    },
    setComment(el, comment) {
        el.data = comment
    }
}
