import type { FilesystemOptions } from './types.js'
import { createFsNode } from './createFsNode.js'
import { createPathNode } from './createPathNode.js'
import { read as readFile, type ReadOptions } from './read.js'
import { readSync as readFileSync, type ReadSyncOptions } from './readSync.js'

export type Filesystem = ReturnType<typeof createFilesystem>

export function createFilesystem(options: FilesystemOptions = {}) {
    const fs = options.fs || createFsNode()
    const path = options.path || createPathNode()

    const locks = new Set<string>()

    function awaitLock(filepath: string, timeout = 1000) {
        return new Promise<void>((resolve, reject) => {
            const interval = setInterval(() => {
                if (!locks.has(filepath)) {
                    clearInterval(interval)
                    resolve()
                }
            }, 100)

            setTimeout(() => {
                clearInterval(interval)
                reject(new Error('Timeout'))
            }, timeout)
        })
    }

    async function read<T extends ReadOptions>(filepath: string, options?: T) {
        return readFile(fs, filepath, options)
    }

    function readSync<T extends ReadSyncOptions>(filepath: string, options?: T) {
        return readFileSync(fs, filepath, options)
    }

    async function write(filename: string, content: Uint8Array, options?: any) {
        if (locks.has(filename)) {
            await awaitLock(filename)
        }

        locks.add(filename)

        if (options?.recursive) {
            const parent = path.dirname(filename)

            await mkdir(parent, { recursive: true })
        }

        await fs.write(filename, content).catch((error) => {
            console.error(`Error writing file ${filename}:`, error)
        })

        locks.delete(filename)
    }

    function writeSync(filename: string, content: Uint8Array, options?: any) {
        if (options?.recursive) {
            const parent = path.dirname(filename)

            mkdirSync(parent, { recursive: true })
        }

        fs.writeSync(filename, content)
    }

    async function mkdir(filepath: string, options?: any) {
        if (await fs.exists(filepath)) return

        if (options?.recursive) {
            const parent = path.dirname(filepath)

            await mkdir(parent, options)
        }

        await fs.mkdir(filepath)
    }

    function mkdirSync(filepath: string, options?: any) {
        if (fs.existsSync(filepath)) return

        if (options?.recursive) {
            const parent = path.dirname(filepath)

            mkdirSync(parent, options)
        }

        fs.mkdirSync(filepath)
    }

    return {
        path,
        fs,

        exists: fs.exists,
        existsSync: fs.existsSync,

        read,
        readSync,

        readdir: fs.readdir,
        readdirSync: fs.readdirSync,

        glob: fs.glob,
        globSync: fs.globSync,

        write,
        writeSync,

        mkdir,
        mkdirSync,

        copy: fs.copy,
        copySync: fs.copySync,

        remove: fs.remove,
        removeSync: fs.removeSync,
    }
}
