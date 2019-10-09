import Counters from '../../src/models/counters'
import State from '../../src/models/state'
import ops from '../../src/operations'
import { List } from 'immutable'

import { countersTemplate } from './remove'

describe("Moving nodes", () => {
    let counters = Counters.fromJS(countersTemplate)

    it("with no counters", () => {
        const state = ops.move(counters, new List([1]), new List([2]))

        const reference = counters
            .deleteIn(['document', 'nodes', 1])
            .updateIn(['document', 'nodes'], nodes =>
                nodes.insert(2, State.fromJS({
                    key: 'p1',
                    type: 'para',
                    counters: { figure: 2 },
                }))
            )
            .setIn(['values', 'p1', 'figure'], 2)

        state.should.equal(reference)
    })

    it("with counters", () => {
        const state = ops.move(counters, new List([0]), new List([2]))

        const reference = counters
            .updateIn(['document', 'nodes'], nodes => nodes
                .deleteIn([1, 'counters', 'figure'])
                .delete(0)
                .insert(2, counters
                    .getIn(['document', 'nodes', 0])
                    .setIn(['counters', 'figure'], 2)
                    .setIn(['nodes', 0, 'counters', 'figure'], 2))
                .setIn([1, 'counters', 'figure'], 1)
                .setIn([1, 'nodes', 0, 'counters', 'figure'], 1)
                .setIn([1, 'nodes', 1, 'counters', 'figure'], 1)
            )
            .deleteIn(['values', 'p1', 'figure'])
            .mergeIn(['values'], {
                f1: { figure: 2 },
                'f1-1': { figure: 2, subfigure: 1 },
                f2: { figure: 1 },
                'f2-1': { figure: 1, subfigure: 1 },
                'f2-2': { figure: 1, subfigure: 2 },
            })

        state.should.equal(reference)
    })

    it("within a nested container", () => {
        const state = ops.move(counters, new List([2, 0]), new List([2, 1]))

        const reference = counters.updateIn(['document', 'nodes', 2, 'nodes'],
            nodes => nodes
                .delete(0)
                .insert(1, nodes.get(0))
                .setIn([0, 'counters', 'subfigure'], 1)
                .setIn([1, 'counters', 'subfigure'], 2)
            )
            .mergeIn(['values'], {
                'f2-1': { figure: 2, subfigure: 2 },
                'f2-2': { figure: 2, subfigure: 1 },
            })

        state.should.equal(reference)
    })

    it("between enclosures", () => {
        const state = ops.move(counters, new List([0, 0]), new List([2, 1]))

        const reference = counters
            .deleteIn(['document', 'nodes', 0, 'nodes', 0])
            .updateIn(['document', 'nodes', 2, 'nodes'], nodes => nodes
                .insert(1, State.fromJS({
                    key: 'f1-1',
                    type: 'subfigure',
                    counters: { figure: 2, subfigure: 2 },
                }))
                .setIn([2, 'counters', 'subfigure'], 3)
            )
            .mergeIn(['values'], {
                'f1-1': { figure: 2, subfigure: 2 },
                'f2-2': { figure: 2, subfigure: 3 },
            })

        state.should.equal(reference)
    })
})
