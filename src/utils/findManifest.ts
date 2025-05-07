import config from '@/config.js'

import { filesystem, transforms } from '@/filesystem.js'
import { findManifestByUrl } from '@/utils/findManifestByUrl.js'

const resolve = filesystem.path.resolve

export interface Options {
    source?: string
    path?: string
    url?: string
}

export interface ItemFile {
    name: string
    optional?: boolean
    path: string
}

export interface Item {
    name: string
    description?: string
    files: ItemFile[]
}

export interface Manifest {
    name: string
    items: Item[]
}

export async function findManifest(options: Options) {
    let manifest = null

    if (options.source) {
        const source = config.sources.find((source: any) => source.name === options.source)

        if (!source) {
            console.log(`Source ${options.source} not found.`)
            return
        }

        if (source.type == 'local') {
            const filename = resolve(source.config.path || '', 'manifest.json')

            const json = filesystem.readSync(filename, {
                transform: transforms.json,
            })

            manifest = json
        }
    }

    if (options.path) {
        const filename = resolve(process.cwd(), options.path || '', 'manifest.json')

        const json = filesystem.readSync(filename, {
            transform: transforms.json,
        })

        manifest = json
    }

    if (options.url) {
        const json = await findManifestByUrl(options.url)

        manifest = json
    }

    return manifest
}
