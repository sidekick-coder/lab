import { type Scheduler } from './createScheduler.js'
import { createCommander } from '@files/modules/commander/index.js'

export function createSchedulerCommander(scheduler: Scheduler) {
    const commander = createCommander()

    commander.add({
        name: 'run',
        description: 'Run the a scheduler by name',
        options: {
            name: {
                type: 'arg',
                description: 'The name of the scheduler to run',
            },
        },
        execute: async ({ options }) => {
            const { name } = options

            await scheduler.run(name)
        },
    })

    commander.add({
        name: 'start',
        description: 'Start the scheduler and keep it running',
        execute: async () => {
            await scheduler.start()
        },
    })

    commander.add({
        name: 'list-routines',
        description: 'List all routines',
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

    return commander
}
