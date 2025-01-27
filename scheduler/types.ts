import type { Logger } from '../logger/index.ts'

export interface RoutineParams {
    logger: Logger
    options: Record<string, any>
}

export interface RoutineDefinition {
    name?: string
    interval: string
    execute(params: RoutineParams): Promise<any>
}

export interface Routine extends RoutineDefinition {
    name: string
    next_run: string
}

export interface SchedulerConfig {
    dirs: string[]
    logger: Logger
    schedule_filename: string
}
