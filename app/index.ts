import { createCommander, type CommanderConfig } from '../commander/index.ts'
import { createLogger, type LoggerOptions } from '../logger/index.ts'
import { createScheduler } from '../scheduler/createScheduler.ts'
import type { SchedulerConfig } from '../scheduler/types.ts'
import minimist from 'minimist'

interface Config {
    commander: Omit<CommanderConfig, 'logger'>
    scheduler: Omit<SchedulerConfig, 'logger'>
    logger: LoggerOptions
}

export function createApp(config: Config) {
    const logger = createLogger(config.logger)

    const commander = createCommander({
        ...config.commander,
        logger: logger,
    })

    const scheduler = createScheduler({
        ...config.scheduler,
        logger: logger,
    })

    async function start() {
        await scheduler.load()
        await commander.load()

        await scheduler.start()

        // keep the app running

        await new Promise(() => {})
    }

    async function run() {
        await commander.load()

        const { _: args, ...options } = minimist(process.argv.slice(2))

        const [name] = args

        return commander.run(name, options)
    }

    commander.add({
        name: 'start',
        async execute({ logger }) {
            logger.info('Starting application')
            await start()
        },
    })

    return {
        run,
        commander,
        scheduler,
        logger,
    }
}
