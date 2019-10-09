import Counters from '../../src/models/counters'
import ops from '../../src/operations'
import { List } from 'immutable'

import schema from '../fixtures/schema'

export const countersTemplate = {
    schema: schema,
    values: {
        f1: { figure: 1 },
        'f1-1': { figure: 1, subfigure: 1 },
        p1: { figure: 1 },
        f2: { figure: 2 },
        'f2-1': { figure: 2, subfigure: 1 },
        'f2-2': { figure: 2, subfigure: 2 },
    },
    document: {
        key: 'd',
        nodes: [
            {
                key: 'f1',
                type: 'figure',
                counters: { figure: 1 },
                nodes: [
                    {
                        key: 'f1-1',
                        type: 'subfigure',
                        counters: { figure: 1, subfigure: 1 },
                    }
                ],
            },
            {
                key: 'p1',
                type: 'para',
                counters: { figure: 1 },
            },
            {
                key: 'f2',
                type: 'figure',
                counters: { figure: 2 },
                nodes: [
                    {
                        key: 'f2-1',
                        type: 'subfigure',
                        counters: { figure: 2, subfigure: 1 },
                    },
                    {
                        key: 'f2-2',
                        type: 'subfigure',
                        counters: { figure: 2, subfigure: 2 },
                    },
                ],
            },
        ],
    }
}

describe("Removing nodes from a document", () => {
    let counters = Counters.fromJS(countersTemplate)

    it("node without counter doesn't affect state", () => {
        const state = ops.delete(counters, new List([1]))

        const reference = counters
            .deleteIn(['document', 'nodes', 1])
            .deleteIn(['values', 'p1'])

        state.should.equal(reference)
    })

    describe("with an existing counter", () => {
        it("the last node using it", () => {
            const state = ops.delete(counters, new List([2]))

            const reference = counters
                .deleteIn(['document', 'nodes', 2])
                .deleteIn(['values', 'f2'])
                .deleteIn(['values', 'f2-1'])
                .deleteIn(['values', 'f2-2'])

            state.should.equal(reference)
        })

        it("before other nodes using it", () => {
            const state = ops.delete(counters, new List([0]))

            const reference = counters
                .deleteIn(['document', 'nodes', 0])
                .deleteIn(['document', 'nodes', 0, 'counters', 'figure'])
                .deleteIn(['values', 'f1'])
                .deleteIn(['values', 'f1-1'])
                .deleteIn(['values', 'p1', 'figure'])
                .setIn(['values', 'f2', 'figure'], 1)
                .setIn(['values', 'f2-1', 'figure'], 1)
                .setIn(['values', 'f2-2', 'figure'], 1)
                .updateIn(['document', 'nodes', 1], node => node
                    .setIn(['counters', 'figure'], 1)
                    .setIn(['nodes', 0, 'counters', 'figure'], 1)
                    .setIn(['nodes', 1, 'counters', 'figure'], 1)
                )

            state.should.equal(reference)
        })
    })

    describe("with an enclosed counter", () => {
        it("within an enclosure with no other nodes", () => {
            const state = ops.delete(counters, new List([0, 0]))

            const reference = counters
                .deleteIn(['document', 'nodes', 0, 'nodes', 0])
                .deleteIn(['values', 'f1-1'])

            state.should.equal(reference)
        })

        it("within an enclosure with other nodes", () => {
            const state = ops.delete(counters, new List([2, 0]))

            const reference = counters
                .deleteIn(['document', 'nodes', 2, 'nodes', 0])
                .deleteIn(['values', 'f2-1'])
                .setIn(['document', 'nodes', 2, 'nodes', 0, 'counters', 'subfigure'], 1)
                .setIn(['values', 'f2-2', 'subfigure'], 1)

            state.should.equal(reference)
        })
    })
})
