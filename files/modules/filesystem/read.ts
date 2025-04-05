import type { FilesystemOptionsFs } from './types.js'

export interface ReadOptions {
    transform?: (content: Uint8Array) => any
}

/* eslint-disable prettier/prettier */
export type ReadResult<T extends ReadOptions> = 
    T extends { transform: (content: Uint8Array) => infer R } ? R
    : Uint8Array
/* eslint-enable prettier/prettier */

export async function read<T extends ReadOptions>(
    fs: FilesystemOptionsFs,
    filepath: string,
    options?: T
) {
    let content = await fs.read(filepath)

    if (content && options?.transform) {
        content = options.transform(content)
    }

    return content as ReadResult<T>
}
