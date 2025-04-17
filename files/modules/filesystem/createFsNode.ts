import fs from 'fs'
import fg from 'fast-glob'
import path from 'path'

import type { FilesystemOptionsFs } from './types.js'

export function createFsNode(): FilesystemOptionsFs {
    const exists: FilesystemOptionsFs['exists'] = async (path: string) => {
        return await fs.promises
            .access(path)
            .then(() => true)
            .catch(() => false)
    }

    const existsSync: FilesystemOptionsFs['existsSync'] = (path: string) => {
        try {
            fs.accessSync(path)
            return true
        } catch (error) {
            return false
        }
    }

    const read: FilesystemOptionsFs['read'] = async (path: string) => {
        const content = await fs.promises.readFile(path)

        return new Uint8Array(content)
    }

    const readSync: FilesystemOptionsFs['readSync'] = (path: string) => {
        const content = fs.readFileSync(path)

        return new Uint8Array(content)
    }

    const readdir: FilesystemOptionsFs['readdir'] = async (path, options) => {
        const files = await fs.promises.readdir(path, {
            withFileTypes: true,
        })

        if (options?.onlyFiles) {
            return files.filter((file) => file.isFile()).map((file) => file.name)
        }

        if (options?.onlyDirectories) {
            return files.filter((file) => file.isDirectory()).map((file) => file.name)
        }

        return files.map((file) => file.name)
    }

    const readdirSync: FilesystemOptionsFs['readdirSync'] = (path: string, options) => {
        const files = fs.readdirSync(path, { withFileTypes: true })

        if (options?.onlyFiles) {
            return files.filter((file) => file.isFile()).map((file) => file.name)
        }

        if (options?.onlyDirectories) {
            return files.filter((file) => file.isDirectory()).map((file) => file.name)
        }

        return files.map((file) => file.name)
    }

    const glob: FilesystemOptionsFs['glob'] = async (pattern: string) => {
        const patterFixed = fg.convertPathToPattern(pattern)

        const files = await fg(patterFixed)

        return files.map(path.normalize)
    }

    const globSync: FilesystemOptionsFs['globSync'] = (pattern: string) => {
        const patterFixed = fg.convertPathToPattern(pattern)

        const files = fg.sync(patterFixed)

        return files.map(path.normalize)
    }

    const write: FilesystemOptionsFs['write'] = async (path: string, content: Uint8Array) => {
        fs.promises.writeFile(path, content)
    }

    const writeSync: FilesystemOptionsFs['writeSync'] = (path: string, content: Uint8Array) => {
        fs.writeFileSync(path, content)
    }

    const mkdir: FilesystemOptionsFs['mkdir'] = async (path: string) => {
        fs.promises.mkdir(path)
    }

    const mkdirSync: FilesystemOptionsFs['mkdirSync'] = (path: string) => {
        fs.mkdirSync(path)
    }

    const copy: FilesystemOptionsFs['copy'] = async (source: string, target: string) => {
        await fs.promises.cp(source, target)
    }

    const copySync: FilesystemOptionsFs['copySync'] = (source: string, target: string) => {
        fs.cpSync(source, target)
    }

    const remove: FilesystemOptionsFs['remove'] = async (path: string) => {
        await fs.promises.rm(path, { recursive: true })
    }

    const removeSync: FilesystemOptionsFs['removeSync'] = (path: string) => {
        fs.rmSync(path, { recursive: true })
    }

    return {
        exists,
        existsSync,

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
    }
}
