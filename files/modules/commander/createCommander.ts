import type { Command, CommanderConfig } from './types.js'
import { validate } from '@files/modules/validator/index.js'
import { schema as sources } from '@files/utils/sources/index.js'
import { createRequire } from 'module'
import { createFilesystem } from '../filesystem/createFilesystem.js'
import { tryCatch } from '@files/utils/tryCatch.js'
import * as ctx from '@files/modules/context/index.js'

const require = createRequire(import.meta.url)

interface AddOptions {
    prefix?: string
}

export function createCommander(payload: CommanderConfig) {
    const commands: Command[] = []
    const filesystem = createFilesystem()
    const resolve = filesystem.path.resolve

    const options = validate(payload, (v) =>
        v.object({
            sources: v.optional(sources()),
        })
    )

    function add(command: Command, options: AddOptions = {}) {
        let name = command.name

        if (options.prefix) {
            name = `${options.prefix}${name}`
        }
        commands.push({
            ...command,
            name: name,
        })
    }

    function addFile(file: string, options: AddOptions = {}) {
        const fileModule = require(file)
        const command = fileModule.default
        const argsDefinition = fileModule.args

        if (!command.name) {
            command.name = filesystem.path.basename(file)
        }

        if (argsDefinition) {
            command.args = argsDefinition
        }

        add(command, options)
    }

    function addDir(dir: string, options: AddOptions = {}) {
        filesystem.readdirSync(dir).forEach((f) => addFile(resolve(dir, f), options))
    }

    async function run(name: string) {
        const command = commands.find((command) => command.name === name)

        if (!command) {
            throw new Error(`Command not found: ${name}`)
        }

        return await command.execute()
    }

    async function handle(args: string[]) {
        let [name] = args

        const exists = commands.some((command) => command.name === name)

        if (!exists) {
            name = 'commander:help'
        }

        ctx.open()

        ctx.provide('commands', commands)
        ctx.provide('args', args.slice(1))

        const [response, error] = await tryCatch(() => run(name))

        ctx.close()

        if (error) {
            throw error
        }

        return response
    }

    // commander commands
    options.sources.forEach((s) => addFile(s))

    addDir(resolve(import.meta.dirname, 'commands'), {
        prefix: 'commander:',
    })

    return {
        commands,
        add,
        addFile,
        addDir,
        run,
        handle,
    }
}
