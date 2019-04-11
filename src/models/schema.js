// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import Immutable from 'immutable'

const TYPES = [
    'enter', 'exit', 'enclose',
]

const UNSUPPORTED_RULES = [
    'data', 'marks', 'text', 'first', 'last', 'nodes',
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
     * Derive counter schema from an array of counter definitions.
     *
     * @param {Array<Object>} definitions
     *
     * @return {Schema}
     */
    static derive(definitions) {
        const sch = {}

        function readDefinition(definition) {
            for (const [type, counters] of Object.entries(definition)) {
                const c = (sch[type] = sch[type] || {})

                for (const [name, schema] of Object.entries(counters)) {
                    c[name] = Counter.fromJS(schema)
                }
            }
        }

        for (const definition of definitions) {
            readDefinition(definition)
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

    /**
     * Compare with another schema
     *
     * @param {object|Schema} other
     *
     * @return {boolean}
     */
    equals(other) {
        for (const [key, value] of Object.entries(this.schema)) {
            if (!(key in other.schema)) return false

            const oth = other.schema[key]

            for (const [name, counter] of this.countersOf(key)) {
                if (!(name in oth)) return false
                if (!Immutable.is(counter, oth[name])) return false
            }
        }
        return true
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

    /**
     * Compare with another counter definition.
     *
     * @param {object|Counter} other
     *
     * @return {boolean}
     */
    equals(other) {
        return this.type === other.type && this.initial === other.initial
    }
}
