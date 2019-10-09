import { Editor, Node, KeyUtils } from 'slate'
import { createHyperscript } from 'slate-hyperscript'

import plugins from '../fixtures/plugins'


const h = createHyperscript({
    blocks: {
        p: 'para',
        figure: 'figure',
        section: 'section',
        subfigure: {
            type: 'subfigure',
            isVoid: true,
        }
    },
    inlines: {
        xref: {
            type: 'xref',
            isVoid: true,
        },
    },
})


function build(type, args) {
    const attrs = typeof args[0] === 'object' && !Node.isNode(args[0])
        ? args.shift()
        : {}

    attrs.key = KeyUtils.create(attrs.key)

    let r = h(type, attrs, ...args)

    if (type === 'value') {
        // KeyUtils.resetGenerator()
    }

    return r
}


const hproxy = new Proxy(buildDocument, {
    get(target, name) {
        return (...args) => build(name, args)
    }
})


export default function buildDocument(cb) {
    // KeyUtils.resetGenerator()
    const value = cb(hproxy)
    return new Editor({ value, plugins }).value
}


export const empty = key => ({
    key: key,
    counters: {},
    nodes: [],
})
