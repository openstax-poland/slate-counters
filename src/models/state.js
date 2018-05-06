import { Record, Map, List, Seq } from 'immutable'

const DEFAULTS = {
    key: null,
    type: null,
    counters: new Map(),
    nodes: new List(),
}

/**
 * State of counters in a single document sub-tree.
 *
 * @property {string} key - key of the node this state belongs to.
 *
 * @property {string|null} type - type of the node. This field is {@code null}
 * for the root node ({@code node.object === 'document'}).
 *
 * @property {Immutable~Map} counters - values of all counters at this point
 * in the document tree.
 *
 * @property {Immutable~List} nodes - states of counters in children of
 * this node. This list includes only block nodes.
 */
export default class State extends Record(DEFAULTS) {
    static fromJS(object) {
        if (object instanceof State) {
            return object
        }

        let { key, type, counters, nodes } = object

        if (!key) {
            throw new Error("key must not be null")
        }

        type = type || null

        counters = new Map(counters)
        nodes = Seq.Indexed(nodes)
            .map(State.fromJS)
            .toList()

        return new State({ key, type, counters, nodes })
    }
}
