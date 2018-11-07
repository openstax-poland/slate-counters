// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import Context from './context'
import React from 'react'
import Counters from '../models/counters'
import { apply } from './changes'
import { derive } from '../operations'

export default function Plugin() {
    let counters = new Counters()

    return {
        onConstruct(editor, next) {
            counters = derive(editor)
            return next()
        },

        onChange(change, next) {
            counters = apply(counters, change)
            return next()
        },

        renderEditor(props, next) {
            return React.createElement(Context, { counters: counters.values }, next())
        },
    }
}
