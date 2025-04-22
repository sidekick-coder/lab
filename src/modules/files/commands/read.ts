import { defineCommand } from '@/core/commander/defineCommand.js'
import { readLabFile } from '@/utils/readItemFile.js'

export default defineCommand({
    name: 'read',
    description: 'Read file contents inside a lab source',
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
        filename: {
            type: 'flag',
            alias: ['f'],
            description: 'Item name to add the files from the source',
        },
    },
    execute: async ({ options }) => {
        if (!options.filename) {
            console.log('Filename is required.')
            return
        }

        const contents = await readLabFile(options)

        console.log('Contents:')

        console.log(contents)
    },
})
