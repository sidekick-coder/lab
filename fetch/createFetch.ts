import type { FetchOptions } from './fetch.ts'
import { $fetch } from './fetch.ts'

export const createFetcher = (options: FetchOptions) => $fetch.extend(options)
