import { resolve } from 'path'
import { createCacheHash } from './createCacheHash.js'
import type { CacheConfig } from './types.js'

export function createCachePath(config: CacheConfig, key: string) {
    const hash = createCacheHash(key)

    return resolve(config.dir, hash)
}
