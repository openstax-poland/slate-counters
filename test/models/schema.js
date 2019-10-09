import Schema, { Counter } from '../../src/models/schema'

describe("Counter schema", () => {
    describe("new Counter", () => {
        it("accepts only correct counter types", () => {
            (() => new Counter()).should.throw(/invalid counter type/)
            ;(() => new Counter('invalid')).should.throw(/invalid counter type/)
            ;(() => new Counter('enter')).should.not.throw()
            ;(() => new Counter('exit')).should.not.throw()
            ;(() => new Counter('enclose')).should.not.throw()
        })

        it("accepts only numbers or undefined as initial values", () => {
            (() => new Counter('enter', true)).should.throw(/initial must be a number/)
            ;(() => new Counter('enter', 12)).should.not.throw()
            new Counter('enter', 12)
                .should.deep.equal({ type: 'enter', initial: 12 })
        })
    })

    describe("Counter#fromJS", () => {
        const test = (name, src, ref) => it(name,
            () => Counter.fromJS(src).should.deep.eq(ref))

        it("from instance", () => {
            const counter = new Counter('enter')
            Counter.fromJS(counter).should.eq(counter)
        })

        it("from invalid type", () => {
            (() => Counter.fromJS(12)).should.throw(/can't load a Counter from/)
        })

        it("from object without `type`", () => {
            (() => Counter.fromJS({})).should.throw(/counter must have a type/)
        })

        test("only type set", { type: 'enter' }, new Counter('enter'))
        test("all properties set",
            { type: 'enter', initial: 12 }, new Counter('enter', 12))
    })

    describe("Schema#fromJS", () => {
        const test = (name, src, ref) => it(name,
            () => Schema.fromJS(src).schema.should.deep.eq(ref))

        test("empty", {}, {})

        test("single node type with a single counter",
            { node: { counter: { type: 'enter' } } },
            { node: { counter: new Counter('enter') } })

        test("multiple node types with multiple counters",
            {
                n1: { c1: { type: 'enter' }, c2: { type: 'exit', initial: 12 } },
                n2: { c1: { type: 'enclose' }, c3: { type: 'enter' } },
            },
            {
                n1: { c1: new Counter('enter'), c2: new Counter('exit', 12) },
                n2: { c1: new Counter('enclose'), c3: new Counter('enter') },
            }
        )
    })

    describe("Schema#derive", () => {
        const test = (name, src, ref) => it(name, () => {
            Schema.derive(src).schema.should.deep.eq(ref)
        })

        test("empty", [], {})

        test("multiple node types with no counters",
            [],
            {})

        test("single node type with a counter",
            [ { n1: { c1: 'enter' } } ],
            { n1: { c1: new Counter('enter') } })

        test("multiple node types with multiple counters",
            [
                { n1: { c1: 'enter', c2: 'exit' } },
                { n2: { c3: { type: 'enclose', initial: 13 } } },
            ],
            {
                n1: { c1: new Counter('enter'), c2: new Counter('exit') },
                n2: { c3: new Counter('enclose', 13) },
            })
    })
})
