import { createFilesystem } from './core/filesystem/index.js'

export const filesystem = createFilesystem()

export const transforms = {
    text: (data: Uint8Array) => {
        const decoder = new TextDecoder('utf-8')

        return decoder.decode(data)
    },
    json: (data: Uint8Array) => {
        return JSON.parse(transforms.text(data))
    },
}

export const parsers = {
    text: (data: string) => {
        const encoder = new TextEncoder()

        return encoder.encode(data)
    },
    json: (data: object) => {
        return parsers.text(JSON.stringify(data))
    },
}
