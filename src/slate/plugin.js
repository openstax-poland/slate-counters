import Context from './context'
import React from 'react'
import Counters from '../models/counters'
import { apply } from './changes'

export default function Plugin() {
    let counters = new Counters()

    return {
        onChange(change) {
            counters = apply(counters, change)
        },
    }
}
