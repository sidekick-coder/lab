import type { SourceOptions } from '@files/utils/sources/types.js'
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
