import { tryCatch } from '@files/utils/tryCatch.js'
import { YAML } from '@files/utils/yaml.js'
import type { FilesystemOptions, ReaddirOptions } from './types.js'
import { createFsNode } from './createFsNode.js'
import { createPathNode } from './createPathNode.js'
import type { ValidatePayload, ValidateResult } from '../validator/validate.js'
import { validate } from '../validator/validate.js'
import { read as readFile, type ReadOptions } from './read.js'
import { readSync as readFileSync, type ReadSyncOptions } from './readSync.js'

export type Filesystem = ReturnType<typeof createFilesystem>

export interface ReadRecordOptions extends ReadOptions {
    reviver?: (key: any, value: any) => any
    default?: Record<string, any>
    schema?: ValidatePayload
}

/*  eslint-disable prettier/prettier */
export type ReadOutput<T extends ReadRecordOptions> =
    T extends { schema: ValidatePayload } ? ValidateResult<T['schema']> | null :
    Record<string, any> | null
/*  eslint-enable prettier/prettier */

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

    async function readdir(filepath: string, options?: ReaddirOptions) {
        return fs.readdir(filepath, options)
    }

    function readdirSync(filepath: string, options?: ReaddirOptions) {
        return fs.readdirSync(filepath, options)
    }

    function glob(pattern: string) {
        return fs.glob(pattern)
    }

    function globSync(pattern: string) {
        return fs.globSync(pattern)
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

        const [, error] = await tryCatch(() => fs.write(filename, content))

        locks.delete(filename)

        if (error) {
            throw error
        }
    }

    write.text = async function (filename: string, content: string, options?: any) {
        await write(filename, new TextEncoder().encode(content), options)
    }

    write.json = async function (filename: string, content: any, options?: any) {
        await write.text(filename, JSON.stringify(content, null, 2), options)
    }

    write.yaml = async function (filename: string, content: any, options?: any) {
        const yamlContent = YAML.stringify(content)

        await write.text(filename, yamlContent, options)
    }

    function writeSync(filename: string, content: Uint8Array, options?: any) {
        if (options?.recursive) {
            const parent = path.dirname(filename)

            mkdirSync(parent, { recursive: true })
        }

        fs.writeSync(filename, content)
    }

    writeSync.text = function (filename: string, content: string, options?: any) {
        writeSync(filename, new TextEncoder().encode(content), options)
    }

    writeSync.json = function (filename: string, content: any, options?: any) {
        writeSync.text(filename, JSON.stringify(content, null, 2), options)
    }

    writeSync.yaml = function (filename: string, content: any, options?: any) {
        const yamlContent = YAML.stringify(content)

        writeSync.text(filename, yamlContent, options)
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

    async function copy(source: string, target: string) {
        return fs.copy(source, target)
    }

    function copySync(source: string, target: string) {
        return fs.copySync(source, target)
    }

    function remove(filepath: string) {
        return fs.remove(filepath)
    }

    function removeSync(filepath: string) {
        return fs.removeSync(filepath)
    }
    function removeAt(filepath: string, miliseconds: number) {
        return fs.removeAt(filepath, miliseconds)
    }

    return {
        path,
        fs,

        exists: fs.exists,
        existsSync: fs.existsSync,

        read,
        readSync,

        readdir,
        readdirSync,

        glob,
        globSync,

        write,
        writeSync,

        mkdir,
        mkdirSync,

        copy,
        copySync,

        remove,
        removeSync,
        removeAt,
    }
}
