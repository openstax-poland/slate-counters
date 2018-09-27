import { update, updateTree } from './update'

/**
 * Merge a node into its previous sibling.
 *
 * @param {Counters} counters
 * @param {List<number>} path
 * @param {number} position
 *
 * @return {Counters}
 */
export function merge(counters, path, position) {
    const index = path.last()
    let removed = null

    counters = update(counters, path.slice(0, -1), (walker, state, counters) => {
        if (index >= state.nodes.size) {
            // Path doesn't exist.
            return state
        }

        // First remove this node from its parent, ...
        removed = state.nodes.get(index)
        state = state.deleteIn(['nodes', index])

        // ... then insert its children into previous node
        state = state.updateIn(['nodes', index - 1], state => {
            state = state.update('nodes', nodes =>
                nodes.splice(position, 0, ...removed.nodes))

            // performing recursive update of that node
            const prev = position === 0 ? state : state.nodes.get(position - 1)

            if (!prev) {
                // Path doesn't exist.
                return state
            }

            walker.reset(counters.values.get(prev.key))

            return updateTree(walker, state, position)
        })

        // and finally update parent
        return updateTree(walker, state, index + 1)
    })

    if (removed == null) {
        // Path didn't exist.
        return counters
    }

    return counters.deleteIn(['values', removed.key])
}
