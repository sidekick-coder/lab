import type { SourceOptions } from '../sources/types.js'

export interface RoutineDefinition {
    name: string
    description?: string
    interval: string
    execute(): Promise<any>
}

export interface Routine extends RoutineDefinition {
    name: string
    next_run: string
}

export interface SchedulerConfig {
    sources?: SourceOptions
}
