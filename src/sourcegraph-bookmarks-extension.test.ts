import mock from 'mock-require'
import { createStubSourcegraphAPI, createStubExtensionContext } from '@sourcegraph/extension-api-stubs'
const sourcegraph = createStubSourcegraphAPI()
mock('sourcegraph', sourcegraph)

import { activate } from './sourcegraph-bookmarks-extension'

describe('sourcegraph-bookmarks-extension', () => {
    it('should activate successfully', async () => {
        const context = createStubExtensionContext()
        await activate(context)
    })
})