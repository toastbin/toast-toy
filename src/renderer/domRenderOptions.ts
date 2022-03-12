import { ElementEvent, RendererOptions } from "./type";

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
    }
}
