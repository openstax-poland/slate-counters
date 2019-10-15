// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import React from 'react'

import CounterContext from './context'
import Counters from '../models/counters'
import { apply } from './changes'
import { derive } from '../operations'

export default function Plugin() {
    let value = null
    let counters = new Counters()

    return {
        onChange(editor, next) {
            if (value === null) {
                counters = derive(editor)
            }
            value = editor.value
            counters = apply(counters, editor)
            return next()
        },

        renderEditor(props, editor, next) {
            return React.createElement(
                CounterContext.Provider,
                { value: counters.values },
                next()
            )
        },
    }
}
