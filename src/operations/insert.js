import { deriveState } from './derive'
import { update, updateTree } from './update'

/**
 * Insert a node into a document.
 *
 * @param {Counters} counters
 * @param {Array<number>} path
 * @param {Slate~Node|State} node
 *
 * @return {Counters}
 */
export function insert(counters, path, node) {
    const position = path[path.length - 1]

    return update(counters, path.slice(0, -1), (walker, state, counters) => {
        // Since we removed last component from path, update() has reset walker
        // not for where we want to insert, but for where |state| is.
        const prev = position === 0 ? state : state.nodes.get(position - 1)
        walker.reset(counters.values.get(prev.key))

        const newState = deriveState(walker, node)

        state = state.update('nodes', nodes => nodes.insert(position, newState))
        return updateTree(walker, state, position + 1)
    })
}
