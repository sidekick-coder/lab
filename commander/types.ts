import type { Logger } from '../logger/index.ts'
import type chalk from 'chalk'
import type { Prompter } from '../prompter/index.ts'

export interface CommandParams {
    options: Record<string, any>
    logger: Logger
    context: Record<string, any>
    colors: typeof chalk
    prompter: Prompter
}

export interface Command {
    name: string
    execute(params: CommandParams): Promise<any> | void
}

export interface CommanderConfig {
    dirs: string[]
    logger: Logger
    context: Record<string, any>
    debug?: boolean
}

export interface Commander {
    commands: Command[]
    load(): Promise<void>
    add(command: Command): void
    addDir(dir: string): void
    run(name: string, options: Record<string, any>): Promise<any>
}
