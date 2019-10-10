// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import { Map, Seq } from 'immutable'

/**
 * A helper that manages states of counters while walking a document tree.
 *
 * Keep in mind that this class is mutable.
 */
export default class Walker {
    /**
     * @param {Schema} schema
     */
    constructor(schema) {
        this.schema = schema
        this.reset()
    }

    /**
     * Re-initialise walker at a specified location in the document tree.
     *
     * Note that this function will discard any changes made so far.
     *
     * @param {Immutable~Map} counters
     */
    reset(counters=new Map()) {
        this.values = {}
        this.stack = []
        this.counters = counters
    }

    /**
     * Descend into a sub-tree.
     *
     * This function will update counter values to correct at this node,
     * returning them. It will also prepare walker for descend into this
     * node's children.
     *
     * You must call {@link #exit} before advancing to the next non-child node.
     *
     * @param {Slate~Node|State} node
     *
     * @return {Immutable~Map}
     */
    enter(node) {
        // First apply all enter counter.
        this.counters = Seq.Keyed(this.schema.countersOf(node.type))
            .filter(counter => counter.type === 'enter')
            .reduce(
                (counters, counter, name) => counters.update(
                    name, counter.initial, x => x + 1),
                this.counters
            )

        // Now that enter counters have been processed we know values on this
        // node, and can remove enclosed counters.
        const counters = this.values[node.key] = this.counters
        const reset = {}

        for (const [name, counter] of this.schema.countersOf(node.type)) {
            if (counter.type === 'enclose' && this.counters.has(name)) {
                reset[name] = this.counters.get(name)
                this.counters = this.counters.delete(name)
            }
        }

        this.stack.push([node.type, reset])

        return counters
    }

    /**
     * Ascend from a sub-tree.
     *
     * This function will update counter values to correct at just after last
     * entered node.
     *
     * @see #enter
     */
    exit() {
        const [type, reset] = this.stack.pop()

        // First remove all enclosed counters, ...
        this.counters = Seq.Keyed(this.schema.countersOf(type))
            .filter(counter => counter.type === 'enclose')
            .reduce(
                (counters, _, name) => counters.delete(name),
                this.counters,
            )

        // ..., then restore values from before this node, ...
        this.counters = this.counters.merge(reset)

        // ..., and finally apply all exit counters.
        this.counters = Seq.Keyed(this.schema.countersOf(type))
            .filter(counter => counter.type === 'exit')
            .reduce(
                (counter, _, name) => counter.update(name, x => x + 1),
                this.counters
            )
    }
}
