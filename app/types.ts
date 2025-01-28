import type { Commander } from '../commander'
import type { Logger } from '../logger'
import type { Scheduler } from '../scheduler/types'

export interface PluginInstallParams {
    scheduler: Scheduler
    commander: Commander
    logger: Logger
    context: Record<string, any>
    plugin(payload: Plugin): void
}

export interface Plugin {
    name?: string
    install(params: PluginInstallParams): Promise<void> | void
}
