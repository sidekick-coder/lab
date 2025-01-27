import type { Command } from './types.ts'
import type { Logger } from '../logger/index.ts'
import { importAll } from '../utils/importAll.ts'

export interface CommanderConfig {
    dirs: string[]
    logger: Logger
}

export function createCommander(config: CommanderConfig) {
    const commands: Command[] = []

    function add(command: Command) {
        commands.push(command)
    }

    async function load() {
        for await (const dir of config.dirs) {
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
    }

    async function run(name: string, options: Record<string, any>) {
        const command = commands.find((command) => command.name === name)

        if (!command) {
            throw new Error(`Command not found: ${name}`)
        }

        return command.execute({
            logger: config.logger,
            options,
        })
    }

    return {
        commands,
        load,
        add,
        run,
    }
}
