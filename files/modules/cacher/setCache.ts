import { date } from '@files/utils/date.js'
import { createCachePath } from './createCachePath.js'
import type { CacheConfig, CacheDefinition, CacheItem } from './types.js'
import { useFilesystem } from '@files/modules/filesystem/injections.js'

function encode(data: any) {
    if (data instanceof Uint8Array) {
        return data
    }

    if (typeof data === 'object') {
        return new TextEncoder().encode(JSON.stringify(data))
    }

    return new TextEncoder().encode(data)
}

export async function setCache(config: CacheConfig, options: CacheDefinition, payload: any) {
    const filesystem = useFilesystem()

    const path = createCachePath(config, options.key)

    const uint8 = encode(payload)

    const optionsFilename = filesystem.path.join(path, 'options.json')
    const contentFilename = filesystem.path.join(path, 'content')

    const item = await filesystem.read(optionsFilename, {
        transform: (content) => {
            return JSON.parse(new TextDecoder('utf-8').decode(content))
        },
    })

    item.expire_at = date.future(options.expires)

    await filesystem.write.json(optionsFilename, item, {
        recursive: true,
    })

    await filesystem.write(contentFilename, uint8, {
        recursive: true,
    })
}
