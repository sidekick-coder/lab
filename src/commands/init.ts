import { defineCommand } from '@/core/commander/defineCommand.js'
import { join, resolve, dirname } from 'path'
import fs from 'fs'
import ejs from 'ejs'
import { input } from '@inquirer/prompts'

function renderTemplate(name, data) {
    const filename = resolve(import.meta.dirname, '..', 'templates', name + '.ejs')

    const content = fs.readFileSync(filename, 'utf-8')
    const template = ejs.compile(content)

    return template(data)
}

export default defineCommand({
    name: 'init',
    description: 'Initialize the lab in the current directory',
    options: {
        name: {
            type: 'arg',
            description: 'Name of the lab',
        },
    },
    async execute({ options }) {
        const root = resolve(import.meta.dirname, '..', '..')
        const pwd = process.cwd()
        const tsconfigLabPath = resolve(root, 'tsconfig.lab.json')

        // Check if the current directory is empty before proceeding
        const dirContents = fs.readdirSync(pwd).filter((f) => f !== '.' && f !== '..')
        if (dirContents.length > 0) {
            console.error('The current directory is not empty. Initialization aborted.')
            return
        }

        let name = options.name

        if (!name) {
            name = await input({
                message: 'Enter the name of the lab:',
                default: 'my-lab',
            })
        }

        const files = [
            {
                template: 'tsconfig.json',
                dest: join(pwd, 'tsconfig.json'),
                data: {
                    tsconfig_lab_path: JSON.stringify(tsconfigLabPath),
                    lab_alias: JSON.stringify(join(root, 'src', '*')),
                    types_node: JSON.stringify(join(root, 'node_modules', '@types', 'node')),
                },
            },
            {
                template: 'lab.mjs',
                dest: join(pwd, 'lab.mjs'),
                data: {
                    name,
                },
            },
            {
                template: 'hello.js',
                dest: join(pwd, 'commands', 'hello.mjs'),
                data: {},
            },
        ]

        for (const file of files) {
            // Ensure the directory for the file exists
            const dir = dirname(file.dest)

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            const content = renderTemplate(file.template, file.data)

            fs.writeFileSync(file.dest, content, 'utf-8')

            console.log(`Created ${file.dest}`)
        }

        console.log(`Initialized lab in ${pwd}`)
    },
})
