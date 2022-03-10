import { effect, reactive } from "./reactivity"
import { computed } from "./reactivity/computed"
import { proxyRefs, ref, toRef, toRefs } from "./reactivity/ref"
import { renderer } from "./renderer"
import { ComponentVnode, ElementVnode } from "./renderer/type"

const foo = ref<string>('foo')
// render func
const componentVnodeFunc: ComponentVnode['tag'] = () => {
    return {
        tag: 'div',
        props: {
            onClick: () => console.log('clicked')
        },
        children: [
            {
                tag: 'span',
                props: {},
                children: foo.value
            }
        ]
    }
}

// object component vnode
const componentVnodeObject: ComponentVnode['tag'] = {
    render: componentVnodeFunc
} 

const vnode: ComponentVnode = {
    tag: componentVnodeObject
}

effect(() => {
    document.querySelector('#app').innerHTML = null
    renderer(vnode, '#app')
})

setTimeout(() => {
    foo.value = '123123'
}, 1000)
