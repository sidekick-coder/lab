import os from 'os'
import { defineCommand } from '@/core/commander/defineCommand.js'
import { filesystem, parsers, transforms } from '@/filesystem.js'
import { checkbox } from '@inquirer/prompts'

export default defineCommand({
    name: 'add',
    description: 'Add item files',
    options: {
        'source': {
            type: 'flag',
        },
        'output': {
            type: 'flag',
            description: 'Folder to output the files',
        },
        'item': {
            type: 'flag',
            description: 'Item name to add the files from the source',
        },
        'generate-index': {
            type: 'flag',
            description: 'Generate index file',
            transform: (value: any) => value === 'true' || value === true,
        },
    },
    execute: async ({ options }) => {
        const resolve = filesystem.path.resolve
        const filename = resolve(os.homedir(), '.sidekick-coder-lab', 'config.json')
        const output = resolve(process.cwd(), options.output || '')
        const itemName = options.item || ''

        if (!options.output || !options.item) {
            console.log('Output folder is required.')
            return
        }

        if (!filesystem.existsSync(filename)) {
            console.log('No sources found.')
            return
        }

        const config = filesystem.readSync(filename, {
            transform: transforms.json,
        })

        const sources = config.sources || []

        const source = sources.find((source: any) => source.name === options.source)

        if (!source) {
            console.log(`Source ${options.source} not found.`)
            return
        }

        const manifestFilename = source.config.path
        const manifestFolder = filesystem.path.dirname(manifestFilename)

        const manifest = filesystem.readSync(source.config.path, {
            transform: transforms.json,
        })

        const item = manifest.items.find((item: any) => item.name === itemName)

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

        for (const file of files) {
            const basename = filesystem.path.basename(file.path)
            const target = filesystem.path.join(output, basename)
            const sourceFile = filesystem.path.join(manifestFolder, file.path)

            filesystem.copySync(sourceFile, target)
        }

        if (options['generate-index']) {
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

            const indexFilePath = filesystem.path.join(output, 'index.ts')

            let content = filesystem
                .readdirSync(output)
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
