import { ElementEvent, RendererOptions } from "./type";

const shouldSetAsProps = (el: HTMLElement, key: string) => {
    if (key === 'form' && el.tagName === 'INPUT') return false;
    return key in el;
}

export const domRenderOptions: RendererOptions = {
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementText(el, text) {
        el.appendChild(document.createTextNode(text))
    },
    insert(el, container) {
        container.appendChild(el)
    },
    setEvent(el, eventName: ElementEvent, listener, options) {
        el.addEventListener(eventName, listener, options)
    },
    patchProps(el, attributeName, value) {
        if (attributeName.startsWith('on')) {
            if (typeof value === 'function') {
                domRenderOptions.setEvent(el, attributeName.replace('on', '').toLowerCase() as ElementEvent, value)
            }
        } else {
            // 属性名存在于 DOM properties 中
            if (shouldSetAsProps(el, attributeName)) {
                if (typeof el[attributeName] === 'boolean' && value === '') {
                    el[attributeName] = true
                } else {
                    el[attributeName] = value
                }
            } else {
                el.setAttribute(attributeName, String(value))
            }
        }
    }
}
