import type { OptionRecord } from './options.js'
import type { Command } from './types.js'

export function defineCommand<T extends OptionRecord>(command: Command<T>) {
    return command
}
