import type { SourceOptions } from '../sources/types.js'

export interface RoutineDefinition {
    name: string
    description?: string
    interval: string
    execute(): Promise<any>
}

export interface RoutineState {
    name: string
    next_run: string
    last_run: string
    count: number
}

export type Routine = RoutineDefinition & RoutineState

export interface SchedulerConfig {
    state?: RoutineState[]
    save?: (state: RoutineState[]) => void
}
