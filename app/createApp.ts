import winston from 'winston'
import type { Commander } from '../commander/index.ts'
import { formatter, type Logger } from '../logger/index.ts'
import type { Scheduler } from '../scheduler/types.ts'
import minimist from 'minimist'
import type { Plugin } from './types.ts'
import dotenv from 'dotenv'
import { filesystem } from '../utils/filesystem.ts'
import { shell } from '../utils/shell.ts'
import { createConfig } from '../utils/createConfig.ts'
import { dirname, resolve } from 'path'
import { provideService } from './win-service.ts'

interface Config {
    name?: string
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

    const name = config.name || dirname(rootDir)

    provideService({
        name,
        description: 'Lab Service',
        script: process.argv[1],
        scriptOptions: ['start'],
        env: {
            FORCE_COLOR: '1',
        },
    })

    const commander = config.commander
    const scheduler = config.scheduler

    commander.addDir(resolve(import.meta.dirname, 'commands'))

    async function start() {
        await scheduler.load()
        await commander.load()

        await scheduler.start()

        process.on('SIGINT', () => {
            logger.info('stopping application', {
                module: 'app',
            })

            process.exit(0)
        })

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

            logger.info('starting application', {
                module: 'app',
            })

            await start()
        },
    })

    commander.add({
        name: 'logs',
        async execute({ options }) {
            const filename = resolve(dirname(process.argv[1]), 'daemon', `${name}.out.log`)

            if (!(await filesystem.exists(filename))) {
                console.log('file not found:', filename)
                return
            }

            const args = ['Get-Content', filename]

            if (options.tail) {
                args.push('-Wait', '-Tail', '30')
            }

            const { child } = shell.execute('powershell', args)

            child.stdout?.pipe(process.stdout)
            child.stderr?.pipe(process.stderr)
        },
    })

    commander.add({
        name: 'scheduler:run',
        async execute({ options }) {
            await scheduler.load()
            await scheduler.run(options.name, options)
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
