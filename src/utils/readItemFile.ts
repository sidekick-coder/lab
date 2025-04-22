import config from '@/config.js'
import { filesystem, transforms } from '@/filesystem.js'
import { findManifestByUrl } from '@/utils/findManifestByUrl.js'
import type { Manifest } from './findManifest.js'

const resolve = filesystem.path.resolve
const dirname = filesystem.path.dirname

export interface ReadLabFileOptions {
    source?: string
    path?: string
    url?: string
    filename: string
}

export async function readLabFile(options: ReadLabFileOptions) {
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
