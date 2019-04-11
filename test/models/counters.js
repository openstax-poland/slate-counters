import { Map, List } from 'immutable'
import Counters from '../../src/models/counters'
import Schema from '../../src/models/schema'

describe("Counters", () => {
    it("#fromJS", () => {
        const schemaTemplate = {
            n1: { c1: 'enter', c2: 'exit' },
            n2: { c2: 'exit', c3: 'enter' },
        }

        const counters = Counters.fromJS({
            values: {
                n1: { c1: 1, c2: 2 },
                n2: { c2: 2, c3: 3 },
            },
            document: {
                key: 'd',
                nodes: [
                    {
                        key: 'n1',
                        type: 'n1',
                        counters: { c1: 1, c2: 2 },
                    },
                    {
                        key: 'n2',
                        type: 'n2',
                        counters: { c2: 2, c3: 3 },
                    },
                ],
            },
            schema: schemaTemplate,
        })

        const n1counters = new Map({ c1: 1, c2: 2 })
        const n2counters = new Map({ c2: 2, c3: 3 })

        const reference = new Map({
            values: new Map({ n1: n1counters, n2: n2counters }),
            document: new Map({
                key: 'd',
                type: null,
                counters: new Map(),
                nodes: new List([
                    new Map({
                        key: 'n1',
                        type: 'n1',
                        counters: n1counters,
                        nodes: new List(),
                    }),
                    new Map({
                        key: 'n2',
                        type: 'n2',
                        counters: n2counters,
                        nodes: new List(),
                    }),
                ]),
            }),
            schema: Schema.fromJS(schemaTemplate),
        })
    })
})
