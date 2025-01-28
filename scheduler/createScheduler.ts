import type { Routine, Scheduler, SchedulerConfig } from './types.ts'
import { importAll } from '../utils/importAll.ts'
import { filesystem } from '../utils/filesystem.ts'
import { date } from '../utils/date.ts'

export function createScheduler(config: SchedulerConfig): Scheduler {
    const routines: Routine[] = []
    const logger = config.logger.child({ module: 'scheduler' })
    const debug = config.debug || false

    const dirs = config.dirs ? [...config.dirs] : []

    function addDir(dir: string) {
        dirs.push(dir)

        if (debug) {
            logger.debug(`adding dir: ${dir}`)
        }
    }

    function add(routine: Routine) {
        routines.push(routine)

        if (debug) {
            logger.debug(`adding routine: ${routine.name}`, {
                routine,
            })
        }
    }

    async function findRouties() {
        const result = [] as Routine[]

        for await (const dir of dirs) {
            const modules = await importAll(dir)

            Object.entries(modules).forEach(([key, m]: any) => {
                if (!m.default) {
                    return
                }

                result.push({
                    name: key,
                    ...m.default,
                })
            })
        }

        return result
    }

    async function load() {
        const definitions = await findRouties()

        const db = await filesystem.read.json(config.schedule_filename, {
            last_update: date.now(),
            routines: [],
        })

        for (const definition of definitions) {
            const db_routine = db.routines.find((r: any) => r.name === definition.name)

            const routine = {
                ...definition,
                next_run: date.future(definition.interval),
            }

            if (db_routine && date.isBefore(db_routine.next_run, routine.next_run)) {
                routine.next_run = db_routine.next_run
            }

            add(routine)
        }
    }

    async function save() {
        await filesystem.write.json(config.schedule_filename, {
            last_update: date.now(),
            routines: routines.map((routine) => ({
                name: routine.name,
                next_run: routine.next_run,
            })),
        })
    }

    async function run(name: string, options: Record<string, any>) {
        const routine = routines.find((routine) => routine.name === name)

        if (!routine) {
            throw new Error(`Routine not found: ${name}`)
        }

        const start = date.now()

        if (debug) {
            logger.debug(`routine start: ${name}`, {
                options,
                date: start,
            })
        }

        const result = routine.execute({
            logger: config.logger,
            options,
        })

        routine.next_run = date.future(routine.interval)

        await save()

        if (debug) {
            logger.debug(`routine end: ${name}`, {
                result,
                start_date: start,
                end_date: date.now(),
                next_run: routine.next_run,
                duration: date.diff(start, date.now()),
            })
        }

        return result
    }

    async function runAll() {
        for (const routine of routines) {
            if (date.isFuture(routine.next_run)) {
                continue
            }

            await run(routine.name, {})
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

        logger.info('scheduler started', {
            routines,
        })
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
        load,
        add,
        addDir,
        run,
    }
}
