import { dirname } from 'path'
import type { Database } from '@sidekick-coder/db/database'
import { createDatabase } from '@sidekick-coder/db/database'
import { resolve as resolveConfig } from '@sidekick-coder/db/config'
import { consoleRender } from '@sidekick-coder/db/renders'
import { parseOptions } from '@sidekick-coder/db/utils'
import { definePlugin } from './definePlugin.js'
import type { Command } from './types.js'
import { inject } from '../context/index.js'
import { kebabCase, lowerCase, upperFirst } from 'lodash-es'

interface OptionRegisterCallback {
    (options: { database: Database; method: string; command: Command }): string[]
}

export interface Options {
    name: string
    path: string
    onRegister?: OptionRegisterCallback
}

export function defineDbPlugin(options: Options) {
    const commands = [] as Command[]

    const config = resolveConfig(options.path)

    for (const source of config.databases.sources) {
        let folder = dirname(options.path)
        const definition = source.data

        if ('dirname' in source) {
            folder = source.dirname
        }

        const database = createDatabase(definition, {
            root: folder,
        })

        const provider = database.provider

        for (const key of Object.keys(provider)) {
            const method = kebabCase(key)

            const command: Command = {
                name: `${database.name}:${method}`,
                categories: [upperFirst(lowerCase(database.name))],
                description: `Run the ${key} command`,
                execute: async () => {
                    const args = inject('commander:args')
                    const options = parseOptions(args, {
                        databaseDefinition: definition,
                    })

                    const output = await provider[key](options)

                    consoleRender.render({
                        method: key,
                        output,
                        options: options.render_options,
                        config: {},
                    })
                },
            }

            if (options.onRegister) {
                options.onRegister({
                    database,
                    method,
                    command,
                })
            }

            commands.push(command)
        }
    }

    return definePlugin({
        name: options.name,
        type: 'command-list',
        commands,
    })
}
