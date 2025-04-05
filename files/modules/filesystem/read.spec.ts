import { beforeEach, expect, it } from 'vitest'
import { createFsFake } from './createFsFake.js'
import { read } from './read.js'

const fs = createFsFake()

function write(filename: string, content: string) {
    fs.entries.set(filename, {
        name: filename,
        path: filename,
        type: 'file',
        content: new TextEncoder().encode(content),
    })
}

beforeEach(() => {
    fs.entries.clear()
})

it('should read a file as uint8', async () => {
    write('file.txt', 'Hello World')

    const result = await read(fs, 'file.txt')

    expect(result).toEqual(new TextEncoder().encode('Hello World'))
})

it('should read a file as text', async () => {
    write('file.txt', 'Hello World')

    const result = await read(fs, 'file.txt', {
        transform: (content) => new TextDecoder().decode(content),
    })

    expect(result).toEqual('Hello World')
})

it('should transform json file', async () => {
    write('file.json', JSON.stringify({ hello: 'world' }))

    const result = await read(fs, 'file.json', {
        transform: (content) => {
            return JSON.parse(new TextDecoder().decode(content))
        },
    })

    expect(result).toEqual({ hello: 'world' })
})
