import { defineCommand } from '../../commander/index.ts'
import { getCache } from '../getCache.ts'
import type { CacheConfig } from '../types.ts'

export default defineCommand({
    name: 'cache:get',
    execute: async ({ context, colors, options }) => {
        const cache = context.cache
        const key = options.key as string
        const format = options.format as 'json' | 'text'

        if (!cache) {
            console.error(colors.red('Cache is not enabled'))
            return
        }

        const config = cache.config as CacheConfig

        const item = await getCache(config, key, format)

        if (!item) {
            console.error(colors.red('Cache not found or expired'))
            return
        }

        console.log(item)
    },
})
