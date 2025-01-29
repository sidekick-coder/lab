import { resolve } from 'path'
import { createCacheHash } from './createCacheHash.ts'
import type { CacheConfig, CacheDefinition } from './types'

export function createCachePath(config: CacheConfig, key: string) {
    const hash = createCacheHash(key)

    return resolve(config.dir, hash)
}
