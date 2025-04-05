export interface CacheDefinition {
    key: string
    expires: string
}

export interface CacheItem extends CacheDefinition {
    expire_at: string
}

export interface CacheConfig {
    dir: string
}
