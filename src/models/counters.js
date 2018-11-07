// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import { Record, Map, Seq } from 'immutable'

import State from './state'
import Schema from './schema'

const DEFAULTS = {
    values: new Map(),
    document: new State(),
    schema: new Schema({}),
}

/**
 * Similarly to Slate's {@link Slate~Value} the purpose of this record is
 * to keep all information about counter states in a document together.
 *
 * @property {Immutable~Map} values - mapping from node keys to counter values
 * on that node. It allows retrieving counter values without traversing
 * document tree.
 *
 * @property {State} document - state of the root node of the document.
 *
 * @property {Schema} schema - counter schema associated with this document.
 */
export default class Counters extends Record(DEFAULTS) {
    static fromJS(object) {
        if (object instanceof Counters) {
            return object
        }

        let { values = {}, document = {}, schema = {} } = object

        document = State.fromJS(document)
        schema = Schema.fromJS(schema)
        values = Seq.Keyed(values)
            .map(values => new Map(values))
            .toMap()

        return new Counters({ document, schema, values })
    }
}
