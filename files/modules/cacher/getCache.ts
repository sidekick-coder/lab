import { date } from '@files/utils/date.js'
import { createCachePath } from './createCachePath.js'
import type { CacheConfig } from './types.js'
import { useFilesystem } from '@files/modules/filesystem/injections.js'

function decode(data: any) {
    return new TextDecoder().decode(data)
}

export async function getCache(config: CacheConfig, key: string, format?: 'json' | 'text') {
    const filesystem = useFilesystem()

    const path = createCachePath(config, key)

    const optionsFilename = filesystem.path.join(path, 'options.json')
    const contentFilename = filesystem.path.join(path, 'content')

    const item = await filesystem.read.json(optionsFilename)

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
