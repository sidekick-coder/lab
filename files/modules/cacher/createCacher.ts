import type { FetchCacher } from '@files/modules/fetcher/fetch.js'
import { getCache } from './getCache.js'
import { setCache } from './setCache.js'
import type { CacheConfig } from './types.js'

export function createCacher(config: CacheConfig) {
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
        fetcher,
    }
}
