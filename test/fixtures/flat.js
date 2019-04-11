import h from '../helpers/h'
import Counters from '../../src/models/counters'
import schema from './schema'

export const value = h(h => h.value(h.document({ key: 'd' },
    h.p({ key: 'p1' }, 'para'),
    h.figure({ key: 'f1' }),
    h.p({ key: 'p2' }, 'para', h.xref({ key: 'x1', target: 'f3' }), 'para'),
    h.figure({ key: 'f2' }),
    h.p({ key: 'p3' }, 'para', h.xref({ key: 'x2', target: 'f2' }), 'para'),
    h.figure({ key: 'f3' }),
)))

export const counters = Counters.fromJS({
    schema: schema,
    values: {
        d: {},
        p1: {},
        f1: { figure: 1 },
        p2: { figure: 1 },
        f2: { figure: 2 },
        p3: { figure: 2 },
        f3: { figure: 3 },
    },
    document: {
        key: 'd',
        counters: {},
        nodes: [
            {
                key: 'p1',
                type: 'para',
                counters: {},
                nodes: [],
            },
            {
                key: 'f1',
                type: 'figure',
                counters: { figure: 1 },
                nodes: [],
            },
            {
                key: 'p2',
                type: 'para',
                counters: { figure: 1 },
                nodes: [],
            },
            {
                key: 'f2',
                type: 'figure',
                counters: { figure: 2 },
                nodes: [],
            },
            {
                key: 'p3',
                type: 'para',
                counters: { figure: 2 },
                nodes: [],
            },
            {
                key: 'f3',
                type: 'figure',
                counters: { figure: 3 },
                nodes: [],
            },
        ],
    },
})
