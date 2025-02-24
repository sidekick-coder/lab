import type { Logger } from '../logger/index.ts'

export interface RoutineParams {
    logger: Logger
    options: Record<string, any>
    context: Record<string, any>
    colors: any
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
    context: Record<string, any>
    debug?: boolean
}

export interface Scheduler {
    routines: Routine[]
    load(): Promise<void>
    add(routine: RoutineDefinition): void
    addDir(dir: string): void
    run(name: string, options: Record<string, any>): Promise<any>
    start(): Promise<void>
    stop(): Promise<void>
}
