import { defineCommand } from '@/core/commander/defineCommand.js'
import { join, resolve } from 'path'
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
        ]

        for (const file of files) {
            const content = renderTemplate(file.template, file.data)
            const dest = file.dest

            fs.writeFileSync(dest, content, 'utf-8')
            console.log(`Created ${dest}`)
        }

        console.log(`Initialized lab in ${pwd}`)
    },
})
