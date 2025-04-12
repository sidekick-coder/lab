import type { Routine, RoutineDefinition, SchedulerConfig } from './types.js'
import { date } from '@files/utils/date.js'

export type Scheduler = ReturnType<typeof createScheduler>

export function createScheduler(payload?: SchedulerConfig) {
    const routines: Routine[] = []

    const state = payload?.state || []
    const save = payload?.save || (() => {})

    function add(defintion: RoutineDefinition) {
        const routine: Routine = {
            name: defintion.name,
            next_run: date.now(),
            last_run: date.now(),
            count: 0,
            ...defintion,
        }

        const exists = routines.some((r) => r.name === routine.name)

        if (exists) {
            return
        }

        const saved = state.find((r: any) => r.name === routine.name)

        if (saved) {
            routine.next_run = saved.next_run
        }

        routines.push(routine)
    }

    function addFile(file: string) {
        const fileModule = require(file)
        const routine = fileModule.default

        if (!routine) return

        add(routine)
    }

    async function run(name: string) {
        const routine = routines.find((routine) => routine.name === name)

        if (!routine) {
            throw new Error(`Routine not found: ${name}`)
        }

        routine.execute().finally(() => {
            routine.next_run = date.future(routine.interval)

            save(
                routines.map((routine) => ({
                    name: routine.name,
                    next_run: routine.next_run,
                    last_run: routine.last_run,
                    count: routine.count,
                }))
            )
        })
    }

    async function runAll() {
        for (const routine of routines) {
            if (date.isFuture(routine.next_run)) {
                continue
            }

            await run(routine.name)
        }
    }

    // run
    let interval: NodeJS.Timeout | undefined

    async function start() {
        await runAll()

        let running = false

        interval = setInterval(async () => {
            if (running) {
                return
            }

            running = true

            await runAll()

            running = false
        }, 16)
    }

    async function stop() {
        if (!interval) {
            return
        }

        clearInterval(interval)

        interval = undefined
    }

    return {
        routines,
        start,
        stop,
        add,
        run,
    }
}
