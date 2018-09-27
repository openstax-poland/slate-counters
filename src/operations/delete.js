import { Seq } from 'immutable'

import { update, updateTree } from './update'

/**
 * Remove node from a document.
 *
 * @param {Counters} counters
 * @param {List<number>} path
 *
 * @return {Counters}
 */
export function delete_(counters, path) {
    const position = path.last()
    let removed = null

    counters = update(counters, path.slice(0, -1), (walker, state, counters) => {
        removed = state.nodes.get(position)
        state = state.deleteIn(['nodes', position])

        // Since we removed last component from path, update() has reset walker
        // not for where we want to remove, but for where |state| is.
        const prev = position === 0 ? state : state.nodes.get(position - 1)
        walker.reset(counters.values.get(prev.key))

        return updateTree(walker, state, position)
    })

    if (removed == null) {
        return counters
    }

    return Seq(iterTree(removed))
        .reduce(
            (counters, node) => counters.deleteIn(['values', node.key]),
            counters
        )
}

function *iterTree(node) {
    yield node
    yield* Seq(node.nodes).flatMap(iterTree)
}
