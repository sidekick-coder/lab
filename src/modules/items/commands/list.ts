import { ui } from '@/core/cli-ui/ui.js'
import { defineCommand } from '@/core/commander/defineCommand.js'
import { findManifest } from '@/utils/findManifest.js'

export default defineCommand({
    name: 'list',
    description: 'List all available items',
    options: {
        source: {
            type: 'flag',
            alias: ['s'],
        },
        path: {
            type: 'flag',
            alias: ['p'],
        },
        url: {
            type: 'flag',
            alias: ['u'],
            description: 'URI to fetch the manifest',
        },
    },
    execute: async ({ options }) => {
        const manifest = await findManifest(options)

        if (!manifest) {
            console.log('Could not retrieve the manifest.')
            return
        }

        ui.array(manifest.items, [
            {
                label: 'Name',
                value: 'name',
            },
            {
                label: 'Description',
                value: 'description',
            },
            {
                label: 'Files',
                value: (item) => {
                    console.log('item', item)
                    return item.files.length
                },
            },
        ])
    },
})
