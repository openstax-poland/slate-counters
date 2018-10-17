import { Map } from 'immutable'

import Counters from '../models/counters'
import Schema from '../models/schema'
import State from '../models/state'

import Walker from './walker'

/**
 * Derive state of counters in a document from a Slate {@link Slate~Editor}.
 *
 * @param {Slate~Editor} editor
 *
 * @return {Counters}
 */
export function derive(editor) {
    const definitions = []
    editor.query('getCounterDefinitions', definitions)

    const schema = Schema.derive(definitions)

    if (editor.value === null) {
        return new Counters({ schema })
    } else {
        const walker = new Walker(schema)
        const document = deriveState(walker, editor.value.document)
        const values = new Map(walker.values)

        return new Counters({ schema, document, values })
    }
}

/**
 * Re-create state of counters for a new document, based on an existing counter
 * schema.
 *
 * @param {Counters} counters
 * @param {Slate~Document} newDocument
 *
 * @return {Counters}
 */
export function reset(counters, newDocument) {
    const walker = new Walker(counters.schema)
    const document = deriveState(walker, newDocument)
    const values = new Map(walker.values)

    return new Counters({ schema: counters.schema, document, values })
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
