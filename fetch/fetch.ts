import qs from 'qs'
import type { RequestInit } from 'undici'
import { fetch, ProxyAgent } from 'undici'
import { merge } from 'lodash-es'
import { filesystem } from '../utils/index.ts'

export interface FetcherConfigProxy {
    name: string
    url: string
}

export interface FetchCacher {
    get: (key: string) => Promise<Uint8Array>
    set: (key: string, value: any, expires: string) => Promise<void>
}

export interface FetchOptions extends RequestInit {
    baseURL?: string
    type?: 'json' | 'text' | 'uint8' | 'response'
    query?: Record<string, any>
    proxy?: string
    proxies?: FetcherConfigProxy[]
    cacher?: FetchCacher
    cache_expires?: string
}

/* eslint-disable prettier/prettier */
export type FetchResponse<T extends FetchOptions> = 
    T extends { type: 'json' } ? Record<string, any> :
    T extends { type: 'text' } ? string :
    T extends { type: 'uint8' } ? Uint8Array :
    Response

/* eslint-enable prettier/prettier */

function format(uint8: Uint8Array, type: FetchOptions['type']) {
    if (type === 'json') {
        const text = new TextDecoder().decode(uint8)

        return JSON.parse(text)
    }

    if (type === 'text') {
        return new TextDecoder().decode(uint8)
    }

    return uint8
}

export async function $fetch<T extends FetchOptions>(
    path: string,
    options?: FetchOptions
): Promise<FetchResponse<T>> {
    const fetchOptions = {
        baseURL: '',
        ...options,
    }

    const url = new URL(filesystem.path.join(fetchOptions.baseURL, path))

    if (options?.query) {
        url.search = qs.stringify(fetchOptions.query)
    }

    const key = url.toString()

    if (options?.cacher && options.cache_expires) {
        const cached = await options.cacher.get(key)

        if (cached) {
            return format(cached, fetchOptions.type)
        }
    }

    if (options?.proxy) {
        const proxy = options.proxies?.find((proxy) => proxy.name === options.proxy)

        fetchOptions.dispatcher = new ProxyAgent(proxy?.url || options.proxy)
    }

    const response = await fetch(url.toString(), fetchOptions)

    const uint8 = new Uint8Array(await response.arrayBuffer())

    if (options?.cacher && options.cache_expires) {
        await options.cacher.set(key, uint8, options.cache_expires)
    }

    if (fetchOptions.type === 'response') {
        return response as any
    }

    return format(uint8, fetchOptions.type)
}

$fetch.extend = function <D extends FetchOptions>(options: D) {
    const defaults = options

    const fetcher = <T extends FetchOptions>(path: string, fetchOptions?: T) => {
        return $fetch<T>(path, merge({}, defaults, fetchOptions))
    }

    fetcher.extend = (newOptions: FetchOptions) => {
        return $fetch.extend(merge({}, defaults, newOptions))
    }

    return fetcher
}
