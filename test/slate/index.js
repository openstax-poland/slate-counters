import State from '../../src/models/state'
import { Editor } from 'slate'
import { Map } from 'immutable'
import { apply } from '../../src/slate/changes'

import plugins from '../fixtures/plugins'
import * as flat from '../fixtures/flat'
import * as deep from '../fixtures/deep'
import * as merge from '../fixtures/merge'

function newChange(value, path, anchorOffset, focusOffset, fn) {
    const node = value.document.getNode(path)
    const editor = new Editor({ value, plugins })

    if (path) {
        editor.select({
            anchor: { key: node.key, offset: anchorOffset },
            focus: { key: node.key, offset: focusOffset },
            isFocused: true,
            isBackwards: false,
        })
    }
    editor.command(fn)

    return editor
}

describe("Slate", () => {
    describe("Operations on value", () => {
        it("setting value data", () => {
            const change = newChange(flat.value, null, null, null, change => change
                .setData({ test: 'value' }))
            const state = apply(flat.counters, change)

            state.should.eq(flat.counters)
        })
    })

    describe("Inserting", () => {
        it("a node with counters", () => {
            const change = newChange(flat.value, [5, 0], 0, 0, change => change
                .moveToStart()
                .insertBlock({ key: 'new', type: 'figure' }))
            const state = apply(flat.counters, change)

            const reference = flat.counters
                .updateIn(['document', 'nodes'], nodes => nodes
                    .insert(6, State.fromJS({
                        key: 'new',
                        type: 'figure',
                        counters: { figure: 4 },
                        nodes: []
                    }))
                )
                .setIn(['values', 'new'], new Map({ figure: 4 }))

            state.should.equal(reference)
        })

        it("characters", () => {
            const change = newChange(flat.value, [0, 0], 3, 3, change => change
                .insertText("hello!"))
            const state = apply(flat.counters, change)

            state.should.equal(flat.counters)
        })
    })

    describe("Deleting", () => {
        it("a node with counters", () => {
            const change = newChange(flat.value, null, 0, 0, change => change
                .removeNodeByKey('f1'))
            const state = apply(flat.counters, change)

            const reference = flat.counters
                .updateIn(['document', 'nodes'], nodes => nodes
                    .deleteIn([2, 'counters', 'figure'])
                    .setIn([3, 'counters', 'figure'], 1)
                    .setIn([4, 'counters', 'figure'], 1)
                    .setIn([5, 'counters', 'figure'], 2)
                    .deleteIn([1])
                )
                .update('values', values => values
                    .delete('f1')
                    .deleteIn(['p2', 'figure'])
                    .setIn(['f2', 'figure'], 1)
                    .setIn(['p3', 'figure'], 1)
                    .setIn(['f3', 'figure'], 2)
                )

            state.should.equal(reference)
        })

        it("characters", () => {
            const change = newChange(flat.value, [2, 0], 4, 4, change => change
                .deleteForward(4))
            const state = apply(flat.counters, change)

            state.should.equal(flat.counters)
        })
    })

    describe("Splitting", () => {
        it("a node without counters", () => {
            const change = newChange(flat.value, [2, 0], 3, 3, change => change
                .splitBlock())
            const state = apply(flat.counters, change)

            // Key generator is reset before each test, so we know that newly
            // created leaf's key will be '0', and node's '1'.
            const reference = flat.counters
                .updateIn(['document', 'nodes'], nodes => nodes
                    .insert(3, State.fromJS({
                        key: '1',
                        type: 'para',
                        counters: { figure: 1 },
                    })))
                .update('values', values => values
                    .set('1', new Map({ figure: 1})))

            state.should.equal(reference)
        })

        it("a node with counters", () => {
            const change = newChange(flat.value, [5, 0], 0, 0, change => change
                .splitBlock())
            const state = apply(flat.counters, change)

            // Key generator is reset before each test, so we know that newly
            // created leaf's key will be '0', and node's '1'.
            const reference = flat.counters
                .updateIn(['document', 'nodes'], nodes => nodes
                    .insert(6, State.fromJS({
                        key: '1',
                        type: 'figure',
                        counters: { figure: 4 },
                        nodes: [],
                    })))
                .setIn(['values', '1'], new Map({ figure: 4 }))

            state.should.equal(reference)
        })
    })

    describe("Merging", () => {
        it("a node without counters into a node with counters", () => {
            const change = newChange(merge.value, [1, 0], 0, 0, change => change
                .deleteBackward())
            const state = apply(merge.counters, change)

            const reference = merge.counters
                .deleteIn(['values', 'p2'])
                .deleteIn(['document', 'nodes', 1])

            state.should.equal(reference)
        })

        it("a node with counters into a node with counters", () => {
            // Not sure how to trigger this operation using standard changes,
            // or how to create an equivalent operation that would still test
            // the right things.
            const change = newChange(merge.value, null, 0, 0, change => change
                .applyOperation({
                    type: 'merge_node',
                    path: [3],
                    position: 1,
                    target: 0,
                    properties: {},
                }))
            const state = apply(merge.counters, change)

            const reference = merge.counters
                .deleteIn(['values', 'f2'])
                .mergeIn(['values', 'f2-1'], { figure: 1, subfigure: 2 })
                .deleteIn(['document', 'nodes', 3])
                .updateIn(['document', 'nodes', 2, 'nodes'], nodes => nodes
                    .insert(1, State.fromJS({
                        key: 'f2-1',
                        type: 'subfigure',
                        counters: { figure: 1, subfigure: 2 },
                    })))

            state.should.equal(reference)
        })
    })

    describe("Moving", () => {
        it("a node without counters", () => {
            const change = newChange(flat.value, [0, 0], 0, 0, change => change
                .moveNodeByKey('p1', 'd', 1))
            const state = apply(flat.counters, change)

            const reference = flat.counters
                .updateIn(['document', 'nodes'], nodes => nodes
                    .insert(2, nodes.get(0).setIn(['counters', 'figure'], 1))
                    .delete(0)
                )
                .setIn(['values', 'p1', 'figure'], 1)

            state.should.equal(reference)
        })

        it("a node with counters", () => {
            const change = newChange(flat.value, [1, 0], 0, 0, change => change
                .moveNodeByKey('f1', 'd', 3))
            const state = apply(flat.counters, change)

            const reference = flat.counters
                .updateIn(['document', 'nodes'], nodes => nodes
                    .setIn([3, 'counters', 'figure'], 1)
                    .deleteIn([2, 'counters', 'figure'])
                    .insert(4, nodes.get(1).setIn(['counters', 'figure'], 2))
                    .delete(1)
                )
                .setIn(['values', 'f1', 'figure'], 2)
                .setIn(['values', 'f2', 'figure'], 1)
                .deleteIn(['values', 'p2', 'figure'])

            state.should.equal(reference)
        })
    })

    describe("Setting", () => {
        it("data of a node", () => {
            const change = newChange(flat.value, [3, 0], 0, 0, change => change
                .setNodeByKey('f2', { data: { test: 'value' } }))
            const state = apply(flat.counters, change)

            state.should.equal(flat.counters)
        })

        it("type of a node", () => {
            const change = newChange(flat.value, [3, 0], 0, 0, change => change
                .setNodeByKey('f2', 'paragraph'))
            const state = apply(flat.counters, change)

            const reference = flat.counters
                .updateIn(['document', 'nodes'], nodes => nodes
                    .setIn([3, 'type'], 'paragraph')
                    .setIn([3, 'counters', 'figure'], 1)
                    .setIn([4, 'counters', 'figure'], 1)
                    .setIn([5, 'counters', 'figure'], 2)
                )
                .update('values', values => values
                    .setIn(['f2', 'figure'], 1)
                    .setIn(['p3', 'figure'], 1)
                    .setIn(['f3', 'figure'], 2)
                )

            state.should.equal(reference)
        })
    })
})
