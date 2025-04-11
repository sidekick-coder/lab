import { it, expect } from 'vitest'
import { parse, type OptionRecord } from './options.js'

it('should parse args and flags', () => {
    const options: OptionRecord = {
        action: {
            type: 'arg',
            description: 'The action to perform',
        },
        flag1: {
            type: 'flag',
            description: 'Flag 1 description',
        },
    }

    const result = parse(options, 'action --flag1 value1')

    expect(result).toEqual({
        _unknown: [],
        action: 'action',
        flag1: 'value1',
    })
})

it('should parse flags with alias', () => {
    const options: OptionRecord = {
        flag1: {
            type: 'flag',
            description: 'Flag 1 description',
            alias: ['f1'],
        },
    }

    const result = parse(options, 'action --f1 value1')

    expect(result).toEqual({
        _unknown: ['action'],
        flag1: 'value1',
    })
})

it('should parse flags with alias single letter', () => {
    const options: OptionRecord = {
        flag1: {
            type: 'flag',
            description: 'Flag 1 description',
            alias: ['f'],
        },
    }

    const result = parse(options, 'action -f value1')

    expect(result).toEqual({
        _unknown: ['action'],
        flag1: 'value1',
    })
})
