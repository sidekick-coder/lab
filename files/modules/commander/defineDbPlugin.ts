import { createDatabaseFromPath } from '@sidekick-coder/db/database'
import { consoleRender } from '@sidekick-coder/db/renders'
import { parseOptions } from '@sidekick-coder/db/utils'
import { definePlugin } from './definePlugin.js'
import type { Command } from './types.js'
import { inject } from '../context/index.js'
import { kebabCase } from 'lodash-es'

export interface Options {
    name: string
    prefix: string
    path: string
}

export function defineDbPlugin(options: Options) {
    const commands = [] as Command[]

    const db = createDatabaseFromPath(options.path)

    function createName(name: string) {
        return options.prefix + ':' + kebabCase(name)
    }

    for (const key of Object.keys(db.provider)) {
        commands.push({
            name: createName(key),
            description: `Run the ${key} command`,
            execute: async () => {
                const args = inject('commander:args')
                const options = parseOptions(args, {
                    databaseDefinition: db.definition,
                })

                const output = await db[key](options)

                consoleRender.render({
                    method: key,
                    output,
                    options: options.render_options,
                    config: {},
                })
            },
        })
    }

    return definePlugin({
        name: options.name,
        type: 'command-list',
        commands,
    })
}
