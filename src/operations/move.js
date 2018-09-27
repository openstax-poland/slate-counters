import { List } from 'immutable'

import { update, recurse, updateTree } from './update'

/**
 * Move a node.
 *
 * @param {Counters} counters
 * @param {List<number>} from
 * @param {List<number>} to
 *
 * @return {Counters}
 */
export function move(counters, from, to) {
    const [common, fromPath_, toPath_] = stripPrefix(from, to)
    // Those three arrays have been cloned in stripPrefix, so we can mutate them
    // freely.
    const fromIndex = fromPath_.last()
    const fromPath = fromPath_.pop()
    const toIndex = toPath_.last()
    const toPath = toPath_.pop()

    return update(counters, common, (walker, state, counters) => {
        let moved = null

        state = doAt(state, fromPath, state => {
            moved = state.nodes.get(fromIndex)
            return state.deleteIn(['nodes', fromIndex])
        })

        state = doAt(state, toPath, state =>
            state.update('nodes', nodes => nodes.insert(toIndex, moved))
        )

        const [updateAt, updateIndex] =
            fromPath.first() === toPath.first()
                // Can only happen when fromPath === toPath === undefined
                ? [new List(), Math.min(fromIndex, toIndex)]
                : fromPath.first() < toPath.first()
                    ? [fromPath, fromIndex]
                    : [toPath, toIndex]

        return recurse(counters, walker, state, updateAt, (walker, state) => {
            const prev = updateIndex === 0 ? state : state.nodes.get(updateIndex - 1)
            walker.reset(counters.values.get(prev.key))

            return updateTree(walker, state, updateIndex)
        })
    })
}

/**
 * Strip a common prefix from two paths.
 *
 * @param {List<number>} a
 * @param {List<number>} b
 *
 * @return {[List<number>, List<number>, List<number>]}
 */
function stripPrefix(a, b) {
    let inx = 0
    const length = Math.min(a.size, b.size)

    for (; inx < length ; ++inx) {
        if (a.get(inx) !== b.get(inx)) {
            break
        }
    }

    return [
        a.slice(0, inx),
        a.slice(inx),
        b.slice(inx),
    ]
}

/**
 * Perform a change deep in tree.
 *
 * @param {State} state
 * @param {List<number>} path
 * @param {function(State, number): State} change
 *
 * @return {State}
 */
function doAt(state, path, change) {
    if (path.size === 0) {
        return change(state)
    }

    return state.updateIn(['nodes', path.first()],
        node => doAt(node, path.slice(1), change))
}
