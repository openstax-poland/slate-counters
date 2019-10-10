const SCHEMA = {
    blocks: {
        paragraph: {},
        figure: {},
        subfigure: {},
        section: {
            isVoid: true,
        },
    },
    inlines: {
        xref: {
            isVoid: true,
            data: {
                target: Boolean,
            },
        },
    },
}

const COUNTERS = {
    figure: {
        figure: 'enter',
        subfigure: 'enclose',
    },
    subfigure: {
        subfigure: 'enter',
    },
    section: {
        section: 'enter',
    },
}

export default [
    {
        schema: SCHEMA,
        queries: {
            getCounterDefinitions(editor, definitions) {
                definitions.push(COUNTERS)
            },
        },
    },
]
