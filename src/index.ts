import { effect, reactive } from './reactivity'
import { ref } from './reactivity/ref'
import { COMMENT, createRenderer, FRAGMENT, TEXT } from './renderer'
import { domRenderOptions } from './renderer/domRenderOptions'
import { VNode } from './renderer/type'

const renderer = createRenderer(domRenderOptions)
const list = reactive<{
    type: 'li',
    children: string
}[]>([
    {
        type: 'li',
        children: 'li1'
    },
    {
        type: 'li',
        children: 'li2'
    },
    {
        type: 'li',
        children: 'li3'
    },
])

effect(() => {
    const vnode: VNode = {
        type: 'ul',
        children: list
    }
    renderer.render(vnode, document.querySelector('#app'))
})
// 
setTimeout(() => {
    list[0].children = 'li4'
    list[1].children = 'li5'
    list[2].children = 'li6'
}, 1000)
