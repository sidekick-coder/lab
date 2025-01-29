import { date } from '../utils/date.ts'
import { filesystem } from '../utils/filesystem.ts'
import { createCachePath } from './createCachePath.ts'
import type { CacheConfig, CacheItem } from './types.ts'

function decode(data: any) {
    return new TextDecoder().decode(data)
}

export async function getCache(config: CacheConfig, key: string, format?: 'json' | 'text') {
    const path = createCachePath(config, key)

    const optionsFilename = filesystem.path.join(path, 'options.json')
    const contentFilename = filesystem.path.join(path, 'content')

    const item: CacheItem | null = await filesystem.read.json(optionsFilename)

    if (!item) {
        return null
    }

    if (!date.isFuture(item?.expire_at)) {
        return null
    }

    const uint8 = await filesystem.read(contentFilename)

    let content: any = uint8

    if (format === 'json') {
        content = JSON.parse(decode(uint8))
    }

    if (format === 'text') {
        content = decode(uint8)
    }

    return {
        options: item,
        content,
    }
}
