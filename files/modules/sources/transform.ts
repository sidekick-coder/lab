import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'
import type { SourceItem, SourceOptions } from './types.js'

export function transform(options: SourceOptions) {
    const filesystem = createFilesystem()
    const resolve = filesystem.path.resolve
    const root = options.baseDir || process.cwd()

    const items = [] as SourceItem[]
    const files: string[] = []

    for (const item of options.items || []) {
        items.push({
            data: item,
        })
    }

    for (const file of options.files || []) {
        files.push(resolve(root, file))
    }

    for (const dir of options.dirs || []) {
        const entries = filesystem.readdirSync(dir)

        entries.forEach((entry) => {
            files.push(resolve(dir, entry))
        })
    }

    for (const pattern of options.patterns || []) {
        const entries = filesystem.globSync(pattern)

        entries.forEach((entry) => {
            files.push(entry)
        })
    }

    return files.filter((f, i, s) => s.indexOf(f) === i)
}
