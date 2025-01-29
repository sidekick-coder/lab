import { definePlugin } from '../app/index.ts'
import { filesystem } from '../utils/filesystem.ts'
import type { CacheConfig } from './types'

export function createCachePlugin(config: CacheConfig) {
    return definePlugin({
        name: 'cache',
        install: ({ context, commander }) => {
            context.cache = {
                config,
            }

            commander.addDir(filesystem.resolve(import.meta.url, 'commands'))
        },
    })
}
