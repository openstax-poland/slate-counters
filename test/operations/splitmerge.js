import Counters from '../../src/models/counters'
import ops from '../../src/operations'
import { List } from 'immutable'

import schema from '../fixtures/schema'

const split = Counters.fromJS({
    schema: schema,
    values: {
        f1: { figure: 1 },
        'f1-1': { figure: 1, subfigure: 1 },
        'f1-2': { figure: 1, subfigure: 2 },
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
                    },
                    {
                        key: 'f1-2',
                        type: 'subfigure',
                        counters: { figure: 1, subfigure: 2 },
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
                    {
                        key: 'f2-2',
                        type: 'subfigure',
                        counters: { figure: 2, subfigure: 2 },
                    },
                ],
            },
        ],
    },
})

const merged = Counters.fromJS({
    schema: schema,
    values: {
        f1: { figure: 1 },
        'f1-1': { figure: 1, subfigure: 1 },
        'f1-2': { figure: 1, subfigure: 2 },
        'f2-1': { figure: 1, subfigure: 3 },
        'f2-2': { figure: 1, subfigure: 4 },
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
                    },
                    {
                        key: 'f1-2',
                        type: 'subfigure',
                        counters: { figure: 1, subfigure: 2 },
                    },
                    {
                        key: 'f2-1',
                        type: 'subfigure',
                        counters: { figure: 1, subfigure: 3 },
                    },
                    {
                        key: 'f2-2',
                        type: 'subfigure',
                        counters: { figure: 1, subfigure: 4 },
                    },
                ],
            },
        ],
    },
})

describe("Splitting and merging nodes", () => {
    it("merging", () => {
        ops.merge(split, new List([1]), 2).should.equal(merged)
    })

    it("splitting", () => {
        const props = { key: 'f2', type: 'figure' }
        ops.split(merged, new List([0]), 2, props).should.equal(split)
    })
})
