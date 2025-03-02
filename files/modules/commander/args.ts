import { inject } from '@files/modules/context/index.js'
import minimist from 'minimist'

export interface ArgDefinition {
    description?: string
}

export interface ArgDefinitionRecord extends Record<string, ArgDefinition> {}

export function defineArgs<T extends ArgDefinitionRecord>(args: T): T {
    return args
}

export function useArgs<T extends ArgDefinitionRecord>(definition: T) {
    const args = inject<string[]>('args').slice()
    const { _ } = minimist(args)

    const result = {} as any

    for (const key in definition) {
        const value = _.shift()

        if (value) {
            result[key] = value
        }
    }

    return result as Record<keyof T, string>
}
