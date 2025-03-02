import { inject } from '@files/modules/context/index.js'
import minimist from 'minimist'

export interface FlagDefinition {
    description?: string
}

export interface FlagDefinitionRecord extends Record<string, FlagDefinition> {}

export function defineFlags<T extends FlagDefinitionRecord>(args: T): T {
    return args
}

export function useFlags<T extends FlagDefinitionRecord>(_definition: T) {
    const args = inject<string[]>('commander:args')

    const flags = minimist(args)

    delete flags._

    const result = flags

    return result
}
