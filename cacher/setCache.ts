import { date } from '../utils/date.ts'
import { filesystem } from '../utils/filesystem.ts'
import { createCachePath } from './createCachePath.ts'
import type { CacheConfig, CacheDefinition, CacheItem } from './types.ts'

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
    const path = createCachePath(config, options.key)

    const uint8 = encode(payload)

    const optionsFilename = filesystem.path.join(path, 'options.json')
    const contentFilename = filesystem.path.join(path, 'content')

    const item: CacheItem = await filesystem.read.json(optionsFilename, {
        ...options,
        expire_at: date.future(options.expires),
    })

    item.expire_at = date.future(options.expires)

    await filesystem.write.json(optionsFilename, item, {
        recursive: true,
    })

    await filesystem.write(contentFilename, uint8, {
        recursive: true,
    })
}
