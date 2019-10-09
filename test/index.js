import chai from 'chai'
import { KeyUtils } from 'slate'

import './models'
import './operations'
import './slate'

chai.should()
chai.use(require('chai-immutable'))

beforeEach(() => {
    KeyUtils.resetGenerator()
})
