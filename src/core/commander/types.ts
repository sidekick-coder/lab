import type { OptionRecord, OptionRecordOutput } from './options.js'

export interface CommandContext<T extends OptionRecord = OptionRecord> {
    args: string[]
    options: OptionRecordOutput<T>
}

export interface Command<T extends OptionRecord = OptionRecord> {
    name: string
    description?: string
    category?: string
    commander?: string
    options?: T
    execute(ctx: CommandContext<T>): Promise<any> | void
}

export interface ConfigHookOptions {
    command: Command
    ctx: CommandContext
}

export interface Config {
    name?: string
    bin?: string
    defaultCommand?: string
    before?: (options: ConfigHookOptions) => void
    after?: (options: ConfigHookOptions) => void
}
