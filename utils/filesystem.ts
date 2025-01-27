import fs from 'fs'
import { tryCatch } from './tryCatch.ts'

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
    const [, error] = await tryCatch(() =>
        fs.promises
            .access(path, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false)
    )

    return error ? false : true
}

export async function readFile(path: string) {
    const [content, error] = await tryCatch(() => fs.promises.readFile(path, 'utf-8'))

    if (error) {
        return null
    }

    return content
}

readFile.json = async function (path: string, defaultValue: any = null) {
    const [content, error] = await tryCatch(() => fs.promises.readFile(path, 'utf-8'))

    if (error) {
        return defaultValue
    }

    return JSON.parse(content)
}

export async function writeFile(path: string, content: string) {
    if (locks.has(path)) {
        await awaitLock(path)
    }

    locks.add(path)

    const [, error] = await tryCatch(() => fs.promises.writeFile(path, content))

    if (error) {
        throw error
    }
}

writeFile.json = async function (path: string, content: any) {
    const [, error] = await tryCatch(() =>
        fs.promises.writeFile(path, JSON.stringify(content, null, 2))
    )

    if (error) {
        throw error
    }
}

export async function lock(path: string) {
    const [, error] = await tryCatch(() => fs.promises.open(path, 'wx'))

    if (error) {
        return false
    }

    return true
}

export const filesystem = {
    exists: fileExists,
    read: readFile,
    write: writeFile,
}
