import { SourceOptions } from '@files/utils/sources/types.js'

export interface Command {
    name: string
    description?: string
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
