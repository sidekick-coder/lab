import fs from 'fs'
import { tryCatch } from './tryCatch.ts'
import path from 'path'
import { fileURLToPath } from 'url'

const locks = new Set<string>()

function awaitLock(path: string, timeout = 1000) {
    return new Promise<void>((resolve, reject) => {
        const interval = setInterval(() => {
            if (!locks.has(path)) {
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

export async function fileExists(path: string) {
    const [, error] = await tryCatch(() => fs.promises.access(path))

    return error ? false : true
}

export async function readFile(path: string) {
    const [content, error] = await tryCatch(() => fs.promises.readFile(path))

    if (error) {
        return null
    }

    return new Uint8Array(content)
}

readFile.text = async function (filepath: string, defaultValue: string = '') {
    const content = await readFile(filepath)

    if (!content) {
        return defaultValue
    }

    return new TextDecoder().decode(content)
}

readFile.json = async function (path: string, defaultValue: any = null) {
    const content = await readFile.text(path)

    if (!content) {
        return defaultValue
    }

    return JSON.parse(content)
}

export async function readDir(path: string, options?: any) {
    const [files, error] = await tryCatch(() =>
        fs.promises.readdir(path, {
            withFileTypes: true,
        })
    )

    if (error) {
        return []
    }

    let result = files

    if (options?.onlyFiles) {
        result = files.filter((file) => file.isFile())
    }

    if (options?.onlyDirectories) {
        result = files.filter((file) => file.isDirectory())
    }

    return result.map((file) => file.name)
}

export async function mkdir(filepath: string, options?: any) {
    if (await fileExists(filepath)) return

    if (options?.recursive) {
        const parent = path.dirname(filepath)

        await mkdir(parent, options)
    }

    await fs.promises.mkdir(filepath, options)
}

export async function writeFile(filename: string, content: Uint8Array, options?: any) {
    if (locks.has(filename)) {
        await awaitLock(filename)
    }

    locks.add(filename)

    if (options?.recursive) {
        const parent = path.dirname(filename)

        await mkdir(parent, { recursive: true })
    }

    const [, error] = await tryCatch(() => fs.promises.writeFile(filename, content))

    locks.delete(filename)

    if (error) {
        throw error
    }
}

writeFile.text = async function (filename: string, content: string, options?: any) {
    await writeFile(filename, new TextEncoder().encode(content), options)
}

writeFile.json = async function (filename: string, content: any, options?: any) {
    await writeFile.text(filename, JSON.stringify(content, null, 2), options)
}

export function resolve(url: string, ...args: string[]) {
    const __dirname = path.dirname(fileURLToPath(url))

    return path.resolve(__dirname, ...args)
}

export const filesystem = {
    path,
    exists: fileExists,
    read: readFile,
    readdir: readDir,
    write: writeFile,
    resolve: resolve,
}
