import { defineCommand } from '../../commander/index.ts'
import { setCache } from '../setCache.ts'
import type { CacheConfig } from '../types.ts'

export default defineCommand({
    name: 'cache:set',
    execute: async ({ context, logger, options }) => {
        const cache = context.cache

        const key = options.key as string
        const value = options.value as string
        const expires = options.expires as string

        if (!cache) {
            logger.error('Cache is not enabled')
            return
        }

        const config = cache.config as CacheConfig

        const definition = {
            key,
            expires,
        }

        await setCache(config, definition, value)
    },
})
