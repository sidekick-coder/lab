import { it, expectTypeOf } from 'vitest'
import { defineOptions, parse } from './options.js'

it('should parse with correct types', () => {
    const options = defineOptions({
        action: {
            type: 'arg',
            description: 'The action to perform',
        },
        flag1: {
            type: 'flag',
            description: 'Flag 1 description',
        },
    })

    const result = parse(options, 'action --flag1 value1')

    expectTypeOf(result).toMatchObjectType<{ _unknown: string[]; action: string; flag1: string }>()
})

it('should parse with correct transformed types', () => {
    const options = defineOptions({
        action: {
            type: 'arg',
            description: 'The action to perform',
            transform: (value) => (value === 'test' ? 1 : 0) as number,
        },
        flag1: {
            type: 'flag',
            description: 'Flag 1 description',
            transform: (value) => value === 'true' || value === '1' || value === 'yes',
        },
    })

    const result = parse(options, 'action --flag1 value1')

    expectTypeOf(result).toMatchObjectType<{ _unknown: string[]; action: number; flag1: boolean }>()
})
