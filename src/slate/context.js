// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import PropTypes from 'prop-types'
import React from 'react'
import * as Immutable from 'immutable'

/**
 * Transparent component providing current counters to its descendants in
 * a context.
 */
export default class CounterContext extends React.Component {
    constructor(...args) {
        super(...args)

        this.listeners = new Map()
    }

    /**
     * Register a component for updates when counters for a node change.
     *
     * Note that only the last registration will be honoured.
     *
     * This is an internal method, you should use {@link WithCounters} instead.
     *
     * @param {React~Component} component
     * @param {String} key
     */
    registerForCounterUpdates(component, key) {
        this.listeners.set(component, key)
    }

    /**
     * Unregister a component from being notified about counter changes.
     *
     * This is an internal method, you should use {@link WithCounters} instead.
     *
     * @param {React~Component} component
     */
    unregisterFromCounterUpdates(component) {
        this.listeners.delete(component)
    }

    getChildContext() {
        return {
            counters: this.props.counters,
            counterUpdater: this,
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.counters.equals(this.props.counters)) {
            return
        }

        for (const [key, value] of this.props.counters.entries()) {
            if (value.equals(prevProps.counters.get(key))) {
                continue
            }

            for (const [listener, k] of this.listeners) {
                if (key === k) {
                    listener.forceUpdate()
                }
            }
        }
    }

    render() {
        return this.props.children
    }
}

CounterContext.childContextTypes = {
    counters: PropTypes.instanceOf(Immutable.Map),
    counterUpdater: PropTypes.instanceOf(CounterContext),
}

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
    class WithCounters extends React.Component {
        componentDidMount() {
            const key = getKey(this.props)
            this.context.counterUpdater.registerForCounterUpdates(this, key)
        }

        componentWillUnmount() {
            this.context.counterUpdater.unregisterFromCounterUpdates(this)
        }

        render() {
            const key = getKey(this.props)
            const counters = this.context.counters.get(key, new Immutable.Map())

            return React.createElement(Component, { counters, ...this.props })
        }
    }

    WithCounters.displayName = `WithCounters(${
        Component.displayName || Component.name
    })`

    WithCounters.contextTypes = CounterContext.childContextTypes

    return WithCounters
}
