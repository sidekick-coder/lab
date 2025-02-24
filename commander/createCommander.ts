import type { Command, Commander, CommanderConfig } from './types.ts'
import { importAll } from '../utils/importAll.ts'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import chalk from 'chalk'
import { date } from '../utils/date.ts'
import { prompter } from '../prompter/index.ts'
import minimist from 'minimist'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function createCommander(config: CommanderConfig): Commander {
    const commands: Command[] = []
    const dirs = config.dirs ? [...config.dirs] : []
    const context = config.context
    const logger = config.logger.child({ module: 'commander' })

    function addDir(dir: string) {
        dirs.push(dir)
    }

    function add(command: Command) {
        if (config.debug) {
            logger.debug(`adding command: ${command.name}`, {
                name: command.name,
            })
        }
        commands.push(command)
    }

    async function load() {
        for await (const dir of dirs) {
            const modules = await importAll(dir)

            Object.entries(modules).forEach(([key, m]: any) => {
                if (!m.default) {
                    return
                }

                add({
                    name: key,
                    ...m.default,
                })
            })
        }

        context['commands'] = commands.map((command) => command.name)
    }

    async function run(name: string, options: Record<string, any>) {
        const start_date = date.now()

        if (config.debug) {
            logger.debug(`running command: ${name}`, {
                name,
                options,
                start_date,
            })
        }

        const command = commands.find((command) => command.name === name)

        if (!command) {
            throw new Error(`Command not found: ${name}`)
        }

        const result = await command.execute({
            logger: config.logger.child({ command: name }),
            context,
            options,
            colors: chalk,
            prompter: prompter,
        })

        const end_date = date.now()

        if (config.debug) {
            logger.debug(`command finished: ${name}`, {
                name,
                options,
                start_date,
                end_date,
                duration: date.diff(start_date, end_date, 'ms'),
                result,
            })
        }
    }

    async function handle(args: string[]) {
        await load()

        const { _, ...options } = minimist(args)

        const [name] = _

        return run(name, options)
    }

    // add defaults
    addDir(resolve(__dirname, 'commands'))

    return {
        commands,
        load,
        add,
        addDir,
        run,
        handle,
    }
}
