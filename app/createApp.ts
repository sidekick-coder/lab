import { createCommander, type CommanderConfig } from '../commander/index.ts'
import { createLogger, type LoggerConfig } from '../logger/index.ts'
import { createScheduler } from '../scheduler/createScheduler.ts'
import type { SchedulerConfig } from '../scheduler/types.ts'
import minimist from 'minimist'
import type { Plugin } from './types.ts'

interface Config {
    debug?: boolean
    commander: Omit<CommanderConfig, 'logger' | 'context'>
    scheduler: Omit<SchedulerConfig, 'logger' | 'context'>
    logger: LoggerConfig
}

export function createApp(config: Config) {
    const logger = createLogger(config.logger)
    const context: any = {}

    const commander = createCommander({
        debug: config.debug,
        ...config.commander,
        logger: logger,
        context: context,
    })

    const scheduler = createScheduler({
        debug: config.debug,
        ...config.scheduler,
        logger: logger,
        context: context,
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
        async execute() {
            // clear
            process.stdout.write('\x1Bc')

            logger.info('Starting application', {
                module: 'app',
            })

            await start()
        },
    })

    async function plugin(payload: Plugin) {
        await payload.install({
            commander,
            scheduler,
            plugin,
            logger,
            context,
        })

        if (config.debug) {
            logger.info(`plugin installed: ${payload.name}`, {
                payload,
            })
        }
    }

    return {
        commander,
        scheduler,
        logger,
        run,
        start,
        plugin,
    }
}
