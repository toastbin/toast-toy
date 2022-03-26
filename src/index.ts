import { effect } from './reactivity'
import { ref } from './reactivity/ref'
import { COMMENT, createRenderer, FRAGMENT, TEXT } from './renderer'
import { domRenderOptions } from './renderer/domRenderOptions'
import { VNode } from './renderer/type'

const foo = ref<string>('foo')
const renderer = createRenderer(domRenderOptions)
const bool = ref<boolean>(false)

effect(() => {
    const vnode: VNode = {
        type: FRAGMENT,
        children: [
            {
                type: 'li',
                children: 'li1'
            },
            {
                type: 'li',
                children: 'li2'
            }
        ]
    }
    renderer.render(vnode, document.querySelector('#app'))
})

setTimeout(() => {
    foo.value = '123123'
}, 1000)
