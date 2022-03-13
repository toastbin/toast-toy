import { effect } from './reactivity'
import { ref } from './reactivity/ref'
import { createRenderer } from './renderer'
import { domRenderOptions } from './renderer/domRenderOptions'
import { ElementVnode } from './renderer/type'

const foo = ref<string>('foo')
const renderer = createRenderer(domRenderOptions)

effect(() => {
    const vnode: ElementVnode = {
        tag: 'div',
        props: {
            onClick: () => console.log('clicked'),
            id: 'foo',
            class: ['aaa', {
                a: true,
                b: false
            }]
        },
        children: [
            {
                tag: 'span',
                children: '1111'
            },
            {
                tag: 'span',
                children: '2222'
            }
        ]
    }
    renderer.render(vnode, document.querySelector('#app'))
})

setTimeout(() => {
    foo.value = '123123'
}, 1000)
