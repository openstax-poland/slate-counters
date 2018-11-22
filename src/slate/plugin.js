// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import Context from './context'
import React from 'react'
import Counters from '../models/counters'
import { apply } from './changes'
import { derive } from '../operations'

export default function Plugin() {
    let value = null
    let counters = new Counters()

    return {
        onChange(change, next) {
            if (value === null) {
                counters = derive(change)
            }
            value = change.value;
            counters = apply(counters, change)
            return next()
        },

        renderEditor(props, editor, next) {
            return React.createElement(Context, { counters: counters.values }, next())
        },
    }
}
