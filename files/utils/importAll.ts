import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'
import { pathToFileURL } from 'url'

export async function importAll(path: string, options?: any) {
    const filesystem = createFilesystem()
    const resolve = filesystem.path.resolve
    const exists = await filesystem.exists(path)

    if (!exists) {
        return {}
    }

    const files = await filesystem.readdir(path)

    const result = {}

    for await (const file of files) {
        if (options?.exclude && options.exclude.includes(file)) {
            continue
        }

        const url = pathToFileURL(resolve(path, file))

        const module = await import(url.href)

        result[file] = module
    }

    return result
}
