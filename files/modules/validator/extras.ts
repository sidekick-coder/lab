import * as v from 'valibot'
import type { ValibotSchema } from './types.js'
import { createPathNode, FilesystemOptionsPath } from '@files/modules/filesystem/index.js'

export function array<T extends ValibotSchema = ValibotSchema>(s: T) {
    return v.pipe(
        v.union([v.array(s), s]),
        v.transform((value) => (Array.isArray(value) ? value : [value])),
        v.array(s)
    )
}

export function path(dirname: string, path: FilesystemOptionsPath = createPathNode()) {
    return v.pipe(
        v.string(),
        v.transform((value) => path.resolve(dirname, value))
    )
}

export function uint8() {
    return v.pipe(
        v.any(),
        v.check((value) => value instanceof Uint8Array),
        v.transform((value) => value as Uint8Array)
    )
}
