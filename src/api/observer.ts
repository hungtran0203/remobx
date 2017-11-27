import {autorun} from './autorun'

/**
 * Utilities
 */

function patch(target: object, funcName: string, runMixinFirst = false) {
    const base = target[funcName]
    const mixinFunc = reactiveMixin[funcName]
    const f = !base
        ? mixinFunc
        : runMixinFirst === true
          ? function() {
                mixinFunc.apply(this, arguments)
                base.apply(this, arguments)
            }
          : function() {
                base.apply(this, arguments)
                mixinFunc.apply(this, arguments)
            }

    target[funcName] = f
}

function mixinLifecycleEvents(target: any) {
    patch(target, "componentWillMount", true)
    patch(target, "componentWillUnmount")
}

/**
 * ReactiveMixin
 */

const disposers = new WeakMap()
const reactiveMixin = {
    componentWillMount: function() {
        // wire up reactive render
        const baseRender = this['render'].bind(this)
        
        let reactInstance = this
        let renderStack:any[] = []
        let isInited = false
        let isReactRenderTrigger = false
        const autoRender = () => {
            renderStack.push(baseRender())
            // forupdate on autorun
            if(!isReactRenderTrigger) {
                isInited && reactInstance['forceUpdate'].call(reactInstance)                
            }
        }

        const reactRender = () => {
            if(!renderStack.length) {
                isReactRenderTrigger = true
                autorun(autoRender)
                isReactRenderTrigger = false
            }
            const rtn = renderStack[renderStack.length - 1]
            renderStack = []
            return rtn
        }

        let initialRender = () => {
            disposers.set(this, autorun(autoRender))
            isInited = true
            this['render'] = reactRender
            return renderStack.shift()
        }

        this['render'] = initialRender
    },

    componentWillUnmount: function() {
        if(disposers.has(this)) {
            const disposer = disposers.get(this)
            if(typeof disposer === 'function') {
                disposer()
            }
        }
        // cleanup reaction
    },

    componentDidMount: function() {},

    componentDidUpdate: function() {},

    shouldComponentUpdate: function(nextProps: any, nextState: any) {}
}

export const observer = (BaseComponent: any) => {
    const target = BaseComponent.prototype || BaseComponent
    mixinLifecycleEvents(target)
    return BaseComponent
}