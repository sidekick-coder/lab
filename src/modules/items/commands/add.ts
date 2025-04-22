import { defineCommand } from '@/core/commander/defineCommand.js'
import { filesystem, parsers, transforms } from '@/filesystem.js'
import { checkbox } from '@inquirer/prompts'
import { findManifest } from '@/utils/findManifest.js'
import { readLabFile } from '@/utils/readItemFile.js'

export default defineCommand({
    name: 'add',
    description: 'Add item files',
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
        output: {
            type: 'flag',
            alias: ['o'],
            description: 'Folder to output the files',
        },
        name: {
            type: 'flag',
            alias: ['n'],
            description: 'Item name to add the files from the source',
        },
        index: {
            type: 'flag',
            alias: ['i'],
            description: 'Generate index file',
            transform: (value: any) => value === 'true' || value === true,
        },
    },
    execute: async ({ options }) => {
        const manifest = await findManifest({
            path: options.path,
            source: options.source,
            url: options.url,
        })

        if (!options.name || !options.output) {
            console.log('Please provide the item name and output folder.')
            return
        }

        const item = manifest.items.find((item: any) => item.name === options.name)

        if (!item) {
            console.log(`Item ${options.name} not found.`)
            return
        }

        let files = []

        if (item.files.length === 1) {
            files = item.files
        }

        if (item.files.length > 1) {
            files = await checkbox({
                message: 'Select the files to add',
                choices: item.files.map((file: any) => ({
                    name: file.name,
                    value: file,
                    checked: !file.optional,
                })),
            })
        }

        if (!filesystem.existsSync(options.output)) {
            filesystem.mkdirSync(options.output, {
                recursive: true,
            })
        }

        for (const file of files) {
            const basename = filesystem.path.basename(file.path)
            const target = filesystem.path.join(options.output, basename)
            const contents = await readLabFile({
                path: options.path,
                source: options.source,
                url: options.url,
                filename: file.path,
            })

            filesystem.writeSync(target, parsers.text(contents))
        }

        if (options['index']) {
            const exclude = [
                'index.ts',
                'index.js',
                '.spec.ts',
                '.spec-d.ts',
                '.spec.js',
                '.test.ts',
                '.test-d.ts',
                '.test.js',
            ]

            const indexFilePath = filesystem.path.join(options.output, 'index.ts')

            let content = filesystem
                .readdirSync(options.output)
                .filter((file) => file.endsWith('.ts'))
                .filter((file) => !exclude.some((ex) => file.includes(ex)))
                .map((file) => file.replace('.ts', '.js'))
                .map((file) => `export * from './${file}'`)
                .join('\n')

            content = `// This file is auto generated\n\n${content}\n`

            filesystem.writeSync(indexFilePath, parsers.text(content))
        }

        console.log('Files added successfully.')

        return
    },
})
