import { effect, reactivityProxy } from "./reactivity"
import { renderer } from "./renderer"
import { ComponentVnode, ElementVnode } from "./renderer/type"

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
                children: 'son'
            }
        ]
    }
}

const obj = reactivityProxy<{
    name: string
}>({
    name: 'taost'
})

effect(() => {
    console.log('effect run')
    console.log(obj.name)
})

// object component vnode
const componentVnodeObject: ComponentVnode['tag'] = {
    render: componentVnodeFunc
} 

const vnode: ComponentVnode = {
    // tag: componentVnodeFunc,
    tag: componentVnodeObject
}

renderer(vnode, '#app')
