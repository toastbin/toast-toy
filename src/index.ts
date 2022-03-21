import { effect } from './reactivity'
import { ref } from './reactivity/ref'
import { COMMENT, createRenderer, TEXT } from './renderer'
import { domRenderOptions } from './renderer/domRenderOptions'
import { VNode } from './renderer/type'

const foo = ref<string>('foo')
const renderer = createRenderer(domRenderOptions)
const bool = ref<boolean>(false)

effect(() => {
    const vnode: VNode = {
        type: 'div',
        props: bool.value ? {
            onClick: () => console.log('outer click'),
        } : {},
        children: [
            {
                type: TEXT,
                children: '123123'
            },
            {
                type: COMMENT,
                children: 'comment'
            }
        ]
    }
    renderer.render(vnode, document.querySelector('#app'))
})

setTimeout(() => {
    foo.value = '123123'
}, 1000)
