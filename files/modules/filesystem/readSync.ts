import type { FilesystemOptionsFs } from './types.js'

export interface ReadSyncOptions {
    transform?: (content: Uint8Array) => any
}

/* eslint-disable prettier/prettier */
export type ReadSyncResult<T extends ReadSyncOptions > = 
    T extends { transform: (content: Uint8Array) => infer R } ? R
    : Uint8Array
/* eslint-enable prettier/prettier */

export function readSync<T extends ReadSyncOptions>(
    fs: FilesystemOptionsFs,
    filepath: string,
    options?: T
) {
    let content = fs.readSync(filepath)

    if (content && options?.transform) {
        content = options.transform(content)
    }

    return content as ReadSyncResult<T>
}
