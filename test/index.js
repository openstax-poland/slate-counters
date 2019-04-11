import chai from 'chai'
import { KeyUtils } from 'slate'

chai.should()
chai.use(require('chai-immutable'))

beforeEach(() => {
    KeyUtils.resetGenerator()
})

import './models'
