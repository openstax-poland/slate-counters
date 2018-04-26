const TYPES = [
    'enter', 'exit', 'enclose',
]

/**
 * A „counter schema” describes how nodes in a document tree affect values
 * of counters at that point in the document.
 *
 * Counter schema is immutable once constructed.
 */
export default class Schema {
    /**
     * Load counter schema from a raw {@code Object}.
     *
     * @param {object|Schema} schema
     *
     * @return {Schema}
     */
    static fromJS(schema) {
        if (schema instanceof Schema) {
            return schema
        }

        const sch = {}

        for (const [type, props] of Object.entries(schema)) {
            const counters = {}

            for (const [name, schema] of Object.entries(props)) {
                counters[name] = Counter.fromJS(schema)
            }

            sch[type] = Object.freeze(counters)
        }

        return new Schema(sch)
    }

    /**
     * Derive counter schema from a Slate document schema.
     *
     * @param {Slate~Schema} schema
     *
     * @return {Schema}
     */
    static derive(schema) {
        const sch = {}

        for (const [type, props] of Object.entries(schema.blocks)) {
            if (props.counters) {
                const counters = {}

                for (const [name, schema] of Object.entries(props.counters)) {
                    counters[name] = Counter.fromJS(schema)
                }

                sch[type] = Object.freeze(counters)
            }
        }

        return new Schema(sch)
    }

    constructor(schema) {
        this.schema = Object.freeze(schema)
        Object.freeze(this)
    }

    /**
     * Get all counters defined for a node type.
     *
     * @param {string} type
     *
     * @yield [string, Counter]
     */
    *countersOf(type) {
        const counters = this.schema[type]

        if (counters) {
            yield* Object.entries(counters)
        }
    }
}

export class Counter {
    static fromJS(object) {
        if (object instanceof Counter) {
            return object
        }

        let type, initial

        if (typeof object === 'string') {
            type = object
        } else if (typeof object === 'object') {
            if (object.type) {
                type = object.type
            } else {
                throw new Error("counter must have a type")
            }
            if (object.initial) {
                initial = object.initial
            }
        } else {
            throw new Error("can't load a Counter from " + typeof object)
        }

        return new Counter(type, initial)
    }

    constructor(type, initial) {
        if (!TYPES.includes(type)) {
            throw new Error("invalid counter type: " + type)
        }
        if (typeof initial !== 'undefined' && typeof initial !== 'number') {
            throw new Error("initial must be a number, not " + typeof initial)
        }

        this.type = type
        this.initial = initial || 0

        Object.freeze(this)
    }
}
