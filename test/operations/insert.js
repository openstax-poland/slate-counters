import Counters from '../../src/models/counters'
import State from '../../src/models/state'
import ops from '../../src/operations'
import { Map, List } from 'immutable'
import { Block } from 'slate'

import schema from '../fixtures/schema'

const countersTemplate = {
    schema: schema,
    values: {
        f1: { figure: 1 },
    },
    document: {
        key: 'd',
        nodes: [
            {
                key: 'p1',
                type: 'para',
            },
            {
                key: 'f1',
                type: 'figure',
                counters: { figure: 1 },
            },
        ],
    }
}

describe("Inserting nodes into a document", () => {
    let counters = Counters.fromJS(countersTemplate)

    const para = Block.create({ type: 'para', key: 'new:para' })
    const section = Block.create({ type: 'section', key: 'new:section' })
    const figure = Block.create({ type: 'figure', key: 'new:figure' })
    const sub1 = Block.create({ type: 'subfigure', key: 'new:sub1' })
    const sub2 = Block.create({ type: 'subfigure', key: 'new:sub2' })

    it("node without counter doesn't affect state", () => {
        const state = ops.insert(counters, new List([1]), para)

        const reference = counters.updateIn(['document', 'nodes'], nodes =>
            nodes.insert(1, State.fromJS({
                key: 'new:para',
                type: 'para',
            }))
        ).setIn(['values', 'new:para'], new Map())

        state.should.equal(reference)
    })

    it("with counter not previously present in document", () => {
        const state = ops.insert(counters, new List([2]), section)

        // section is inserted after f1, thus the figure counter is defined
        // for it.
        const sectionCounters = new Map({ section: 1, figure: 1 })
        const reference = counters.updateIn(['document', 'nodes'], nodes =>
            nodes.insert(2, State.fromJS({
                key: 'new:section',
                type: 'section',
                counters: sectionCounters,
            }))
        ).setIn(['values', 'new:section'], sectionCounters)

        state.should.equal(reference)
    })

    describe("with an existing counter", () => {
        it("after last node using it", () => {
            const state = ops.insert(counters, new List([2]), figure)

            const figureCounters = new Map({ figure: 2 })
            const reference = counters.updateIn(['document', 'nodes'], nodes =>
                nodes.insert(2, State.fromJS({
                    key: 'new:figure',
                    type: 'figure',
                    counters: figureCounters,
                }))
            ).setIn(['values', 'new:figure'], figureCounters)

            state.should.equal(reference)
        })

        it("before other nodes using it", () => {
            const state = ops.insert(counters, new List([0]), figure)

            const figureCounters = new Map({ figure: 1 })
            const reference = counters.updateIn(['document', 'nodes'], nodes =>
                nodes.insert(0, State.fromJS({
                    key: 'new:figure',
                    type: 'figure',
                    counters: figureCounters,
                })).setIn([1, 'counters', 'figure'], 1)
                   .setIn([2, 'counters', 'figure'], 2)
            ).setIn(['values', 'new:figure'], figureCounters)
             .setIn(['values', 'p1', 'figure'], 1)
             .setIn(['values', 'f1', 'figure'], 2)

            state.should.equal(reference)
        })
    })

    describe("with an enclosed counter", () => {
        let cns = counters

        it("within an enclosure with no other nodes", () => {
            const state = ops.insert(counters, new List([1, 0]), sub1)

            const sfCounters = new Map({ figure: 1, subfigure: 1 })
            const reference = counters.updateIn(
                ['document', 'nodes', 1, 'nodes'],
                nodes => nodes.insert(0, State.fromJS({
                    key: 'new:sub1',
                    type: 'subfigure',
                    counters: sfCounters,
                }))
            ).setIn(['values', 'new:sub1'], sfCounters)

            state.should.equal(reference)
            // We want to reuse this in the next test.
            cns = reference
        })

        it("within a different enclosure", () => {
            const initialCounters = new Map({ figure: 2 })
            const initial = cns.updateIn(['document', 'nodes'], nodes =>
                nodes.insert(2, State.fromJS({
                    key: 'new:figure',
                    type: 'figure',
                    counters: initialCounters,
                }))
            ).setIn(['values', 'new:figure'], initialCounters)

            const state = ops.insert(initial, new List([2, 0]), sub2)

            const sfCounters = new Map({ figure: 2, subfigure: 1 })
            const reference = initial.updateIn(
                ['document', 'nodes', 2, 'nodes'],
                nodes => nodes.insert(0, State.fromJS({
                    key: 'new:sub2',
                    type: 'subfigure',
                    counters: sfCounters,
                }))
            ).setIn(['values', 'new:sub2'], sfCounters)

            state.should.equal(reference)
        })
    })
})
