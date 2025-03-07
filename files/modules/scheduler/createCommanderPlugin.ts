import { type Scheduler } from './createScheduler.js'
import { type Command, definePlugin, useArgs } from '@files/modules/commander/index.js'

interface Options {
    name?: string
}

export function createCommanderPlugin(scheduler: Scheduler, options?: Options) {
    const commands = [] as Command[]

    commands.push({
        name: 'scheduler:run',
        description: 'Run the a scheduler by name',
        categories: ['Scheduler'],
        execute: async () => {
            const args = useArgs({
                name: {
                    description: 'The name of the scheduler to run',
                },
            })

            await scheduler.run(args.name)
        },
    })

    commands.push({
        name: 'scheduler:start',
        description: 'Start the scheduler and keep it running',
        categories: ['Scheduler'],
        execute: async () => {
            await scheduler.start()
        },
    })

    commands.push({
        name: 'routines:list',
        description: 'List all routines',
        categories: ['Scheduler'],
        execute: async () => {
            const data = scheduler.routines.map((routine) => ({
                name: routine.name,
                description: routine.description,
                next_run: routine.next_run,
            }))

            if (data.length === 0) {
                console.log('No routines found')
                return
            }

            console.table(data)
        },
    })

    return definePlugin({
        name: options?.name || 'scheduler',
        type: 'command-list',
        commands,
    })
}
