import type { Routine, RoutineDefinition, SchedulerConfig } from './types.js'
import { schema as sources } from '@files/modules/sources/index.js'
import { date } from '@files/utils/date.js'
import { useFilesystem } from '@files/modules/filesystem/index.js'
import { validate } from '@files/modules/validator/index.js'

export type Scheduler = ReturnType<typeof createScheduler>

export function createScheduler(payload: SchedulerConfig) {
    const filesystem = useFilesystem()
    const resolve = filesystem.path.resolve
    const dirname = filesystem.path.dirname
    const routines: Routine[] = []

    const options = validate(payload, (v) =>
        v.object({
            sources: v.optional(sources()),
            filename: v.optional(v.string(), resolve(dirname(process.argv[1]), 'routines.json')),
        })
    )

    const config = filesystem.readSync.json(options.filename, {
        default: {
            last_update: date.now(),
            routines: [],
        },
    })

    function add(defintion: RoutineDefinition) {
        const routine = {
            name: defintion.name,
            next_run: date.now(),
            ...defintion,
        }

        const exists = routines.some((r) => r.name === routine.name)

        if (exists) {
            return
        }

        const saved = config.routines.find((r: any) => r.name === routine.name)

        if (saved) {
            routine.next_run = saved.next_run
        }

        routines.push(routine)
    }

    function addFile(file: string) {
        const fileModule = require(file)
        const routine = fileModule.default

        if (!routine) return

        if (!routine.name) {
            routine.name = filesystem.path.basename(file)
        }

        add(routine)
    }

    function addDir(dir: string) {
        filesystem.readdirSync(dir).forEach((f) => addFile(resolve(dir, f)))
    }

    function save() {
        const json = {
            last_update: date.now(),
            routines: routines.map((routine) => ({
                name: routine.name,
                next_run: routine.next_run,
            })),
        }

        filesystem.writeSync.json(options.filename, json, {
            recursive: true,
        })
    }

    async function run(name: string) {
        const routine = routines.find((routine) => routine.name === name)

        if (!routine) {
            throw new Error(`Routine not found: ${name}`)
        }

        routine.execute().finally(() => {
            routine.next_run = date.future(routine.interval)

            save()
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
        addDir,
        run,
    }
}
