import h, { empty } from '../helpers/h'
import Counters from '../../src/models/counters'
import schema from './schema'

export const value = h(h => h.value(h.document({ key: 'd' },
    h.p({ key: 'p1' }, 'para'),
    h.figure({ key: 'f1' }),
    h.p({ key: 'p2' }, 'para', h.xref({ key: 'x1', target: 'f2-2' })),
    h.section({ key: 's1' },
        h.figure({ key: 'f2' },
            h.subfigure({ key: 'f2-1', isVoid: true }),
            h.subfigure({ key: 'f2-2', isVoid: true }),
        ),
        h.p({ key: 'p3' }, 'para', h.xref({ key: 'x2', target: 'f2-1'})),
        h.figure({ key: 'f3' },
            h.subfigure({ key: 'f3-1', isVoid: true }),
            h.subfigure({ key: 'f3-2', isVoid: true }),
        ),
    ),
)))

export const counters = Counters.fromJS({
    schema: schema,
    values: {
        d: {},
        p1: {},
        f1: { figure: 1 },
        p2: { figure: 1 },
        s1: { figure: 1, section: 1 },
        f2: { figure: 2, section: 1 },
        'f2-1': { figure: 2, subfigure: 1, section: 1 },
        'f2-2': { figure: 2, subfigure: 2, section: 1 },
        p3: { figure: 2, section: 1 },
        f3: { figure: 3, section: 1 },
        'f3-1': { figure: 3, subfigure: 1, section: 1 },
        'f3-2': { figure: 3, subfigure: 2, section: 1 },
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
                key: 's1',
                type: 'section',
                counters: { figure: 1, section: 1 },
                nodes: [
                    {
                        key: 'f2',
                        type: 'figure',
                        counters: { figure: 2, section: 1 },
                        nodes: [
                            {
                                key: 'f2-1',
                                type: 'subfigure',
                                counters: { figure: 2, subfigure: 1, section: 1 },
                                nodes: [],
                            },
                            {
                                key: 'f2-2',
                                type: 'subfigure',
                                counters: { figure: 2, subfigure: 2, section: 1 },
                                nodes: [],
                            }
                        ],
                    },
                    {
                        key: 'p3',
                        type: 'para',
                        counters: { figure: 2, section: 1 },
                        nodes: [],
                    },
                    {
                        key: 'f3',
                        type: 'figure',
                        counters: { figure: 3, section: 1 },
                        nodes: [
                            {
                                key: 'f3-1',
                                type: 'subfigure',
                                counters: { figure: 3, subfigure: 1, section: 1 },
                                nodes: [],
                            },
                            {
                                key: 'f3-2',
                                type: 'subfigure',
                                counters: { figure: 3, subfigure: 2, section: 1 },
                                nodes: [],
                            }
                        ],
                    },
                ],
            },
        ],
    },
})
