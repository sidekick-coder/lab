import { createHelpText, type Section } from './createHelpText.js'
import type { Command } from './types.js'

interface Options {
    bin?: string
}

export function createCommandHelp(command: Command, options: Options = {}) {
    const sections = [] as Section[]
    const bin = options.bin || 'node index.js'

    const args = Object.entries(command.options || {})
        .filter((o) => o[1].type === 'arg')
        .map(([key, definition]) => ({
            title: key,
            description: definition.description,
        }))
    const flags = Object.entries(command.options || {})
        .filter((o) => o[1].type === 'flag')
        .map(([key, definition]) => ({
            title: key,
            description: definition.description,
        }))

    if (args.length) {
        sections.push({
            title: 'Arguments',
            items: args,
        })
    }

    if (flags.length) {
        sections.push({
            title: 'Flags',
            items: flags,
        })
    }

    const title = `Usage: ${bin} ${command.name} [OPTIONS]`
    const description = command.description || 'Display help information for commands'

    return createHelpText({
        title,
        description,
        sections,
    })
}
