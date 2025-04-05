import type { FetchOptions } from './fetch.js'
import { $fetch } from './fetch.js'

export const createFetcher = (options: FetchOptions) => $fetch.extend(options)
