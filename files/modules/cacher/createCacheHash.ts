import { createHash } from 'crypto'

export function createCacheHash(key: string) {
    return createHash('sha256').update(key).digest('hex')
}
