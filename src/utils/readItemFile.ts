import config from '@/config.js'
import { filesystem, transforms } from '@/filesystem.js'

const resolve = filesystem.path.resolve

export interface ReadLabFileOptions {
    source?: string
    path?: string
    url?: string
    filename: string
}

export async function readLabFile(options: ReadLabFileOptions) {
    if (options.source) {
        const source = config.sources.find((source: any) => source.name === options.source)

        if (!source) {
            console.log(`Source ${options.source} not found.`)
            return
        }

        if (source.type == 'local') {
            const filename = resolve(source.config.path || '', options.filename)

            return filesystem.readSync(filename, {
                transform: transforms.text,
            })
        }
    }

    if (options.path) {
        const filename = resolve(options.path, options.filename)

        return filesystem.readSync(filename, {
            transform: transforms.text,
        })
    }

    if (options.url && options.url.includes('github.com')) {
        const url = new URL(options.url)
        const username = url.pathname.split('/')[1]
        const repository = url.pathname.split('/')[2]

        const rawUrl = `https://raw.githubusercontent.com/${username}/${repository}/HEAD/${options.filename}`

        const response = await fetch(rawUrl)

        const text = await response.text()

        return text
    }

    throw new Error('Could not find the lab file.')
}
