import { effect, reactiveProxy } from "./reactivity"
import { computed } from "./reactivity/computed"
import { watch } from "./reactivity/watch"
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

// const obj = reactiveProxy<{
//     name: string,
//     ok: boolean,
//     foo: string,
//     a?: number
// }>({
//     name: 'toast',
//     ok: true,
//     // @ts-ignore 先忽略
//     get foo() {
//         return 'foo ' + this.name
//     }
// })

// effect(() => {
//     console.log('effect run')
//     console.log(obj.ok ? obj.name : 'not name')
// })

// setTimeout(() => {
//     obj.ok = false
// }, 1000)

// eg：针对不会使用到的响应式数据，副作用函数不执行
// setTimeout(() => {
//     obj.name ='asdads'
// }, 2000)

// eg：effect 嵌套
// 修改外层副作用函数 name 值，不会触发外层函数执行 反而执行内层函数
// effect(() => {
//     console.log('run effect outter')
//     effect(() => {
//         console.log('run effect inner')
//         console.log(obj.ok, 'ok')
//     })
//     console.log(obj.name, 'name')
// })

// setTimeout(() => {
//     obj.name = '123'
// }, 1000)

// 添加 scheduler options
// effect(() => {
//     console.log(obj.name);
// }, {
//     scheduler(fn) {
//         setTimeout(fn)
//     }
// })

// obj.name = 'lhb'
// console.log('end')

// lazy options
// const computedA = computed(() => obj.name + '111')
// console.log(computedA.value, 'computedA')
// obj.name = 'asddas'
// console.log(computedA.value, 'computedA')

// 在副作用函数中读取 computed
// effect(() => {
//     console.log(computedA.value)
// })
// 验证是否触发上面副作用函数的响应
// obj.name = 'qwer'

// watch
// watch(() => obj.name, (oldVal, newVal) => {
//     console.log('name changed')
//     console.log(oldVal, newVal)
// }, {
    // immediate: true
    // flush: 'post'
// })

// setTimeout(() => {
//     obj.name = 'asdas'
// }, 1000)

// 响应式数据中存在 getter 
// effect(() => {
//     console.log(obj.foo, 'foo')
// })

// setTimeout(() => {
//     obj.name = 'lhb123'
// }, 500)

// 追踪 for ... in ...
// effect(() => {
//     for(const k in obj) {
//         console.log(k, 'key')
//     }
// })

// obj.a = 1
// obj.a = 2

// setTimeout(() => {
//     console.log('*****')
//     delete obj.foo
// }, 300)

// 值不发生变化不触发响应
// effect(() => {
//     console.log(obj.name, 'effect')
// })

// obj.name = 'toast'

// 处理原型上的值
// const child = reactiveProxy<{
//     foo: number
// }>({
//     foo: 999
// })

// const parent = reactiveProxy<{
//     bar: number
// }>({
//     bar: 1
// })

// Object.setPrototypeOf(child, parent)

// effect(() => {
//     // @ts-ignore
//     // child 没有 bar 属性，所以会去读取原型上 parent 的属性
//     // child 与 parent 都是响应式数据，所以执行了两次
//     console.log(child.bar)
// })

// // @ts-ignore
// // 触发两次副作用函数
// child.bar = 2

// 深 reactive
const obj = reactiveProxy({
    a: {
        b: 1
    }
})

effect(() => {
    console.log(obj.a.b, 'bbbb')
})

obj.a.b = 2

// object component vnode
const componentVnodeObject: ComponentVnode['tag'] = {
    render: componentVnodeFunc
} 

const vnode: ComponentVnode = {
    // tag: componentVnodeFunc,
    tag: componentVnodeObject
}

renderer(vnode, '#app')
