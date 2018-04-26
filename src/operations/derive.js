import { Map } from 'immutable'

import Counters from '../models/counters'
import Schema from '../models/schema'
import State from '../models/state'

import Walker from './walker'

/**
 * Derive state of counters in a document from a Slate {@link Slate~Value}.
 *
 * @param {Slate~Value} value
 *
 * @return {Counters}
 */
export function derive(value) {
    const schema = Schema.derive(value.schema)
    const walker = new Walker(schema)
    const document = deriveState(walker, value.document)
    const values = new Map(walker.values)

    return new Counters({ schema, document, values })
}

/**
 * Derive state of counters in a single document sub-tree.
 *
 * @param {Walker} walker
 * @param {Slate~Node} node
 *
 * @return {State}
 */
export function deriveState(walker, node) {
    if (node.object !== 'block' && node.object !== 'document') {
        // We only track block nodes.
        return null
    }

    const counters = walker.enter(node)

    const nodes = node.nodes
        .toSeq()
        .map(node => deriveState(walker, node))
        .filter(state => state !== null)
        .toList()

    walker.exit()

    return new State({
        key: node.key,
        type: node.type || null,
        counters, nodes,
    })
}
