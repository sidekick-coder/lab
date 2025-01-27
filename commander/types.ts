import type { Logger } from '../logger/index.ts'

export interface CommandParams {
    options: Record<string, any>
    logger: Logger
}

export interface Command {
    name: string
    execute(params: CommandParams): Promise<any>
}
