import fs from 'fs'
import winston from 'winston'
import type { Commander } from '../commander/index.ts'
import { formatPretty, type Logger } from '../logger/index.ts'
import type { Scheduler } from '../scheduler/types.ts'
import minimist from 'minimist'
import type { Plugin } from './types.ts'
import dotenv from 'dotenv'
import { filesystem } from '../utils/filesystem.ts'
import { shell } from '../utils/shell.ts'
import { createConfig } from '../utils/createConfig.ts'
import { resolve } from 'path'

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

    const labConfig = createConfig(resolve(rootDir, '.lab', 'config.json'), {
        pid: null as null | number,
    })

    const commander = config.commander
    const scheduler = config.scheduler

    async function start() {
        const filename = resolve(rootDir, '.lab', 'app.log')
        // to keep logs from detached process
        await filesystem.write.text(filename, '', {
            recursive: true,
        })

        const stream = fs.createWriteStream(resolve(rootDir, '.lab', 'app.log'), { flags: 'a' })

        logger.add(new winston.transports.Stream({ stream, format: formatPretty }))

        console.log = function (message: any) {
            stream.write(message + '\n')
            process.stdout.write(message + '\n') // Keep showing logs in terminal
        }

        console.error = function (message: any) {
            stream.write(message + '\n')
            process.stderr.write(message + '\n')
        }

        await scheduler.load()
        await commander.load()

        await scheduler.start()

        process.on('SIGINT', async () => {
            logger.info('stopping application', {
                module: 'app',
            })

            labConfig.pid = null

            process.exit(0)
        })

        labConfig.pid = process.pid

        // keep the app running
        await new Promise(() => {})
    }

    async function stop() {
        logger.info('stopping application', {
            module: 'app',
        })

        const command = shell.execute('taskkill', ['/pid', labConfig.pid.toString(), '/f', '/t'])

        await command.ready

        labConfig.pid = null

        process.exit(0)
    }

    async function run() {
        await commander.load()

        const { _: args, ...options } = minimist(process.argv.slice(2))

        const [name] = args

        return commander.run(name, options)
    }

    async function startDetach() {
        const main = process.argv[1]

        const { child } = shell.execute('node', [main, 'start'], {
            detached: true,
            stdio: 'ignore',
        })

        child.unref()

        logger.info('started in detached mode', {
            module: 'app',
            pid: child.pid,
        })

        process.exit(0)
    }

    commander.add({
        name: 'start',
        async execute({ options }) {
            if (labConfig.pid) {
                logger.warn('process already running', {
                    module: 'app',
                    pid: labConfig.pid,
                })

                return
            }

            if (options.detach) {
                return startDetach()
            }

            // clear
            process.stdout.write('\x1Bc')

            logger.info('Starting application', {
                module: 'app',
            })

            await start()
        },
    })

    commander.add({
        name: 'stop',
        async execute() {
            if (!labConfig.pid) {
                logger.warn('process not running', {
                    module: 'app',
                })

                return
            }

            await stop()
        },
    })

    commander.add({
        name: 'show',
        async execute() {
            logger.info('showing application', {
                module: 'app',
                pid: labConfig.pid,
            })
        },
    })

    commander.add({
        name: 'logs',
        async execute() {
            const logFile = resolve(rootDir, '.lab', 'app.log')

            const { child } = shell.execute('powershell', [
                'Get-Content',
                logFile,
                '-Wait',
                '-Tail',
                '30',
            ])

            child.stdout?.pipe(process.stdout)
            child.stderr?.pipe(process.stderr)

            await new Promise(() => {})
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
