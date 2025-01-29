import type { Commander } from '../commander/index.ts'
import type { Logger } from '../logger/index.ts'
import type { Scheduler } from '../scheduler/types.ts'
import minimist from 'minimist'
import type { Plugin } from './types.ts'
import dotenv from 'dotenv'
import { filesystem } from '../utils/filesystem.ts'

interface Config {
    rootDir?: string
    commander: Commander
    scheduler: Scheduler
    logger: Logger
    context?: Record<string, any>
}

export function createApp(config: Config) {
    const logger = config.logger
    const context = config.context || {}
    const rootDir = config.rootDir || process.cwd()

    dotenv.config({ path: filesystem.path.join(rootDir, '.env') })

    const commander = config.commander
    const scheduler = config.scheduler

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
