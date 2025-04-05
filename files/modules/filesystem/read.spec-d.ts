import { expectTypeOf, it } from 'vitest'
import { createFsFake } from './createFsFake.js'
import { read } from './read.js'

const fs = createFsFake()

it('should return type uint8', async () => {
    const result = await read(fs, 'file.txt')

    expectTypeOf(result).toEqualTypeOf<Uint8Array>()
})

it('should return type text', async () => {
    const result = await read(fs, 'file.json', {
        transform: (content) => {
            return new TextDecoder().decode(content)
        },
    })

    expectTypeOf(result).toEqualTypeOf<string>()
})

it('should return type json', async () => {
    const result = await read(fs, 'file.json', {
        transform: (content) => {
            return JSON.parse(new TextDecoder().decode(content)) as Record<string, unknown>
        },
    })

    expectTypeOf(result).toEqualTypeOf<Record<string, unknown>>()
})
