import Schema from '../../src/models/schema'

export default Schema.fromJS({
    figure: {
        figure: {
            type: 'enter',
            initial: 0,
        },
        subfigure: {
            type: 'enclose',
            initial: 0,
        },
    },
    section: {
        section: {
            type: 'enter',
            initial: 0,
        },
    },
    subfigure: {
        subfigure: {
            type: 'enter',
            initial: 0,
        },
    },
})
