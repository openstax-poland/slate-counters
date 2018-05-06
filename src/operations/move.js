import { update, recurse, updateTree } from './update'

/**
 * Move a node.
 *
 * @param {Counters} counters
 * @param {number[]} from
 * @param {number[]} to
 *
 * @return {Counters}
 */
export function move(counters, from, to) {
    const [common, fromPath, toPath] = stripPrefix(from, to)
    // Those three arrays have been cloned in stripPrefix, so we can mutate them
    // freely.
    const fromIndex = fromPath.pop()
    const toIndex = toPath.pop()

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
            fromPath[0] === toPath[0]
                // Can only happen when fromPath === toPath === undefined
                ? [[], Math.min(fromIndex, toIndex)]
                : fromPath[0] < toPath[0]
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
 * @param {number[]} a
 * @param {number[]} b
 *
 * @return {[number[], number[], number[]]}
 */
function stripPrefix(a, b) {
    let inx = 0
    const length = Math.min(a.length, b.length)

    for (; inx < length ; ++inx) {
        if (a[inx] !== b[inx]) {
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
 * @param {number[]} path
 * @param {function(State, number): State} change
 *
 * @return {State}
 */
function doAt(state, path, change) {
    if (path.length === 0) {
        return change(state)
    }

    return state.updateIn(['nodes', path[0]],
        node => doAt(node, path.slice(1), change))
}
