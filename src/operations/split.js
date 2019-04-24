// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import State from '../models/state'
import { update, updateTree } from './update'

/**
 * Split a node.
 *
 * @param {Counters} counters
 * @param {List<number>} path
 * @param {number} position
 * @param {object} props
 * @param {string} props.key
 * @param {string} props.type
 *
 * @return {Counters}
 */
export function split(counters, path, position, props) {
    const index = path.last()

    return update(counters, path.slice(0, -1), (walker, state, counters) => {
        let nodes = null

        if (!state.nodes || state.nodes.size === 0) {
            // The splitted node was an inline, and we only track blocks.
            return state
        }

        // Remove split children from their parent, ...
        state = state.updateIn(['nodes', index], state => {
            nodes = state.nodes.slice(position)

            return state.update('nodes', nodes => nodes.splice(position))
        })

        // ... reset walker to just before where we'll create the new node, ...
        const prev = state.nodes.get(index)
        walker.reset(counters.values.get(prev.key))

        // ... insert split nodes into the newly created node, ...
        const newState = createNew(walker, props, nodes)
        state = state.update('nodes', nodes => nodes.insert(index + 1, newState))

        // ... and finally update tree after new node
        return updateTree(walker, state, index + 2)
    })
}

/**
 * Create state for a new node.
 *
 * @param {Walker} walker
 * @param {object} props
 * @param {string} props.key
 * @param {string} props.type
 * @param {Immutable~List<State>} nodes
 *
 * @return {State}
 */
function createNew(walker, props, nodes) {
    const counters = walker.enter(props)

    const { key, type } = props
    let state = new State({ key, type, counters, nodes })

    state = updateTree(walker, state)

    walker.exit()

    return state
}
