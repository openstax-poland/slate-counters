import h from '../helpers/h'
import Counters from '../../src/models/counters'
import schema from './schema'

export const value = h(h => h.value(h.document({ key: 'd'},
    h.p({ key: 'p1' }, 'para'),
    h.p({ key: 'p2' }, 'para'),
    h.figure({ key: 'f1' },
        h.subfigure({ key: 'f1-1', isVoid: true }),
    ),
    h.figure({ key: 'f2' },
        h.subfigure({ key: 'f2-1', isVoid: true }),
    ),
)))

export const counters = Counters.fromJS({
    schema: schema,
    values: {
        d: {},
        p1: {},
        p2: {},
        f1: { figure: 1 },
        'f1-1': { figure: 1, subfigure: 1 },
        f2: { figure: 2 },
        'f2-1': { figure: 2, subfigure: 1 },
    },
    document: {
        key: 'd',
        nodes: [
            {
                key: 'p1',
                type: 'para',
            },
            {
                key: 'p2',
                type: 'para',
            },
            {
                key: 'f1',
                type: 'figure',
                counters: { figure: 1 },
                nodes: [
                    {
                        key: 'f1-1',
                        type: 'subfigure',
                        counters: { figure: 1, subfigure: 1 },
                    },
                ],
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
                ],
            },
        ]
    }
})
