import type { SourceOptions } from '@files/modules/sources/types.js'
import type { ArgDefinitionRecord } from './args.js'
import type { FlagDefinitionRecord } from './flags.js'

export interface Command {
    name: string
    description?: string
    category?: string
    args?: ArgDefinitionRecord
    flags?: FlagDefinitionRecord
    execute(): Promise<any> | void
}

export interface CommanderConfig {
    binName: string
    sources: SourceOptions
    manifest: string
    defaultCommand?: string
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

export interface ManifestPlugin extends PluginExecute {
    manifest: Manifest
}

export interface Manifest {
    name: string
    commands: Omit<Command, 'execute'>[]
    plugins: ManifestPlugin[]
}

export type Plugin = PluginExecute | PluginCommandList
