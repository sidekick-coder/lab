import type { SourceOptions } from '@files/modules/sources/types.js'
import type { ArgDefinitionRecord } from './args.js'

export interface Command {
    name: string
    description?: string
    args?: ArgDefinitionRecord
    execute(): Promise<any> | void
}

export interface CommanderConfig {
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
