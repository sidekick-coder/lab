import type { OptionRecord, OptionRecordOutput } from './options.js'

export interface CommandContext<T extends OptionRecord = OptionRecord> {
    options: OptionRecordOutput<T>
}

export interface Command<T extends OptionRecord = OptionRecord> {
    name: string
    description?: string
    category?: string
    module?: string
    options?: T
    execute(ctx: CommandContext<T>): Promise<any> | void
}

export interface PluginExecute {
    name: string
    type: 'execute'
    manifest?: any
    execute(options: string[]): Promise<any>
}

export interface PluginCommandList {
    name: string
    prefix?: string
    type: 'command-list'
    commands: Command[]
}

export type Plugin = PluginExecute | PluginCommandList
