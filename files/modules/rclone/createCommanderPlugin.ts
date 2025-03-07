import type { RCloneInstance } from './createRCloneInstance.js'
import { type Command, definePlugin, useFlags } from '@files/modules/commander/index.js'

interface Options {
    name?: string
}

export function createCommanderPlugin(instance: RCloneInstance, options?: Options) {
    const commands = [] as Command[]

    commands.push({
        name: 'rclone:sync',
        description: 'Run rclone sync with the given configuration',
        categories: ['RClone'],
        execute: async () => {
            const flags = useFlags({
                options: {
                    description: 'Extra options to pass to the scheduler',
                },
            })

            await instance.run('sync', flags.options)
        },
    })

    commands.push({
        name: 'rclone:bisync',
        description: 'Run rclone sync with the given configuration',
        categories: ['RClone'],
        execute: async () => {
            const flags = useFlags({
                options: {
                    description: 'Extra options to pass to the scheduler',
                },
            })

            await instance.run('bisync', flags.options)
        },
    })

    commands.push({
        name: 'rclone:check',
        description: 'Run rclone sync with the given configuration',
        categories: ['RClone'],
        execute: async () => {
            const flags = useFlags({
                options: {
                    description: 'Extra options to pass to the scheduler',
                },
            })

            await instance.run('check', flags.options)
        },
    })

    return definePlugin({
        name: options?.name || 'RClone',
        type: 'command-list',
        commands,
    })
}
