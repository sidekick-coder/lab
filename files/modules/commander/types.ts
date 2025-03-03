import type { SourceOptions } from '@files/modules/sources/types.js'
import type { ArgDefinitionRecord } from './args.js'
import type { FlagDefinitionRecord } from './flags.js'

export interface Command {
    name: string
    description?: string
    categories?: string[]
    args?: ArgDefinitionRecord
    flags?: FlagDefinitionRecord
    execute(): Promise<any> | void
}

export interface CommanderConfig {
    binName?: string
    sources?: SourceOptions
}

export interface Commander {
    commands: Command[]
    load(): Promise<void>
    add(command: Command): void
    addDir(dir: string): void
    run(name: string, options: Record<string, any>): Promise<any>
    handle(args: string[]): Promise<any>
}

export interface PluginExecute {
    name: string
    type: 'execute'
    execute(options: string[]): Promise<any>
}

export interface PluginCommandList {
    name: string
    prefix?: string
    type: 'command-list'
    commands: Command[]
}

export type Plugin = PluginExecute | PluginCommandList
