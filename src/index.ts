import { effect } from './reactivity'
import { ref } from './reactivity/ref'
import { createRenderer } from './renderer'
import { domRenderOptions } from './renderer/domRenderOptions'
import { ElementVnode } from './renderer/type'

const foo = ref<string>('foo')
const renderer = createRenderer(domRenderOptions)
const bool = ref<boolean>(false)

effect(() => {
    const vnode: ElementVnode = {
        type: 'div',
        props: bool.value ? {
            onClick: () => console.log('outer click'),
        } : {},
        children: [
            {
                type: 'span',
                children: '1111',
                props: {
                    onClick: () => {
                        bool.value = true
                        console.log('inner click')
                    }
                }
            },
        ]
    }
    renderer.render(vnode, document.querySelector('#app'))
})

setTimeout(() => {
    foo.value = '123123'
}, 1000)
