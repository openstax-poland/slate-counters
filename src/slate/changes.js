// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import { Change } from 'slate'

import * as ops from '../operations'
import * as util from '../util'

/**
 * Apply operations to a counter state.
 *
 * @param {Counters} counters
 * @param {Slate~Operation|Slate~Change} op
 *
 * @return {Counters}
 */
export function apply(counters, op) {
    if (op instanceof Change) {
        return op.operations.reduce(apply, counters)
    }

    const applier = APPLIERS[op.type]

    if (!applier) {
        throw new Error("Unknown operation type: " + op.type)
    }

    return applier(counters, op)
}

/**
 * @type {(function(Counters, Slate~Operation): Counters)[]}
 */
const APPLIERS = {
    insert_node,
    merge_node,
    move_node,
    remove_node,
    set_node,
    set_value,
    split_node,

    // Explicitly ignore operations which can't affect numbering.
    insert_text: util.identity,
    remove_text: util.identity,
    add_mark: util.identity,
    remove_mark: util.identity,
    set_mark: util.identity,
    set_selection: util.identity,
}

export function set_value(counters, op) {
    return ops.reset(counters, op.value.document)
}

export function insert_node(counters, op) {
    // We only track block nodes.
    if (op.node.object !== 'block') {
        return counters
    }

    return ops.insert(counters, op.path, op.node)
}

export function remove_node(counters, op) {
    return ops.delete(counters, op.path)
}

export function merge_node(counters, op) {
    return ops.merge(counters, op.path, op.position)
}

export function move_node(counters, op) {
    return ops.move(counters, op.path, op.newPath)
}

export function set_node(counters, op) {
    const { type } = op.properties

    // The only property we care about is type, as it controls which counter
    // rules apply to a given node.
    if (!type) {
        return counters
    }

    return ops.update(counters, op.path, (walker, state) => {
        return ops.updateCounters(walker, state.set('type', type))
    })
}

export function split_node(counters, op) {
    if (!op.properties.type) {
        return counters
    }

    return ops.split(counters, op.path, op.position, op.properties)
}
