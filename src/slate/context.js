// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import React from 'react'
import * as Immutable from 'immutable'

const CounterContext = React.createContext(new Immutable.Map())
export default CounterContext

/**
 * A higher-order component providing current counters to the base component.
 *
 * @example
 *
 * @WithCounters(({ node }) => node.key)
 * function NodeComponent({ node, counters }) {
 *     // Here counters is an Immutable.js Map containing values of counter for
 *     // node.
 * }
 */
export const WithCounters = getKey => Component => {
    function WithCounters(props) {
        const key = getKey(props)
        return React.createElement(
            CounterContext.Consumer,
            null,
            counters => React.createElement(Component, {
                counters: counters.get(key, new Immutable.Map()),
                ...props,
            })
        )
    }

    WithCounters.displayName = `WithCounters(${
        Component.displayName || Component.name
    })`

    return WithCounters
}
