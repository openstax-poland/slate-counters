import { Editor } from 'slate'

import ops from '../../src/operations'
import plugins from '../fixtures/plugins'
import * as deep from '../fixtures/deep'
import * as flat from '../fixtures/flat'

describe("Deriving counter states form a document", () => {
    it("flat document", () => {
        const editor = new Editor({ plugins, value: flat.value })
        ops.derive(editor).should.equal(flat.counters)
    })

    it("nested document", () => {
        const editor = new Editor({ plugins, value: deep.value })
        ops.derive(editor).should.equal(deep.counters)
    })
})
