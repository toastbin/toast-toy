import { mountElement } from "./renderer"

const vnode = {
    tag: 'div',
    props: {
        onClick: () => console.log('clicked')
    },
    children: 'click me'
}

mountElement(vnode, '#app')
