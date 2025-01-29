import type { FetchCacher } from '../fetch/fetch.ts'
import { createCachePlugin } from './createCachePlugin.ts'
import { getCache } from './getCache.ts'
import { setCache } from './setCache.ts'
import type { CacheConfig } from './types'

export function createCacher(config: CacheConfig) {
    const plugin = createCachePlugin(config)

    const fetcher: FetchCacher = {
        async get(key) {
            const item = await getCache(config, key)

            return item?.content
        },
        set(key, value, expires) {
            return setCache(config, { key, expires }, value)
        },
    }

    return {
        config,
        plugin,
        fetcher,
    }
}
