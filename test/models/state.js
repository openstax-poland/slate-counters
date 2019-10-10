import { List, Map } from 'immutable'

import State from '../../src/models/state'

describe("Counter state", () => {
    describe("#fromJS", () => {
        const test = (name, src, ref) => it(name,
            () => State.fromJS(src).should.equal(ref))

        it("requires a key", () => {
            (() => State.fromJS({})).should.throw(/key must not be null/)
        })

        it("is an identity when called with a State object", () => {
            const a = new State()
            const b = State.fromJS(a)
            a.should.equal(b)
        })

        test("just key",
            { key: 'test' },
            new State({
                key: 'test',
                type: null,
                counters: new Map(),
                nodes: new List(),
            }))

        test("maps object to Map for #counters",
            { key: 'test', counters: { c1: 1, c2: 2 } },
            new State({ key: 'test', counters: new Map({ c1: 1, c2: 2 }) }))

        test("transitively converts #nodes",
            {
                key: 't1',
                counters: { c1: 1 },
                nodes: [
                    {
                        key: 't2',
                        counters: { c2: 2 },
                    },
                    {
                        key: 't3',
                        counters: { c3: 3 },
                    },
                ],
            },
            new State({
                key: 't1',
                counters: new Map({ c1: 1 }),
                nodes: new List([
                    new State({
                        key: 't2',
                        counters: new Map({ c2: 2 }),
                    }),
                    new State({
                        key: 't3',
                        counters: new Map({ c3: 3 }),
                    }),
                ]),
            }))
    })
})
