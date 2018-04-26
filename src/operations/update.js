import Walker from './walker'

/**
 * @function
 * @name UpdateFunction
 *
 * @param {Walker} walker
 * @param {State} state
 * @param {Counters} counters
 *
 * @return {State}
 */

/**
 * Perform a nested update.
 *
 * @param {Counters} counters
 * @param {Array<number>} path
 * @param {UpdateFunction} change
 *
 * @return {Counters}
 */
export function update(counters, path, change) {
    const walker = new Walker(counters.schema)
    const document = recurse(counters, walker, counters.document, path, change)

    return counters.withMutations(counters => {
        return counters
            .set('document', document)
            .mergeIn(['values'], walker.values)
    })
}

/**
 * Perform a nested update.
 *
 * @param {Counters} counters
 * @param {Walker} walker
 * @param {State} state
 * @param {Array<number>} path
 * @param {UpdateFunction} change
 *
 * @return {State}
 */
function recurse(counters, walker, state, path, change) {
    const index = path[0]
    const rest = path.slice(1)

    if (path.length === 0) {
        // Should only ever happen if we're modifying document node itself.
        return change(walker, state, counters)
    }

    if (rest.length === 0) {
        const prev = index === 0 ? state : state.nodes.get(index - 1)
        walker.reset(counters.values.get(prev.key))

        return state.updateIn(['nodes', index],
            node => change(walker, node, counters))
    }

    state = state.updateIn(['nodes', index],
        node => recurse(counters, walker, node, rest, change))

    return updateTree(walker, state, index + 1)
}

/**
 * Transitively update counter values in a sub-tree, after an operation
 * elsewhere in the document may have invalidated them.
 *
 * @param {Walker} walker
 * @param {State} state
 * @param {number} [start=0]
 *
 * @return {State}
 */
export function updateTree(walker, state, start=0) {
    // Why, oh why, is there no List#scan?
    return state.update('nodes', nodes => nodes.withMutations(nodes => {
        for (let index=start ; index < nodes.size ; ++index) {
            nodes = nodes.update(index, node => updateCounters(walker, node))
        }
        return nodes
    }))
}

/**
 * Update counter values in a node, and transitively its children, after
 * an operation elsewhere in the document may have invalidated them.
 *
 * @param {Walker} walker
 * @param {State} state
 *
 * @return {State}
 */
export function updateCounters(walker, state) {
    const counters = walker.enter(state)

    state = state.withMutations(state =>
        updateTree(walker, state)
            .mergeIn(['counters'], counters)
    )

    walker.exit()

    return state
}
