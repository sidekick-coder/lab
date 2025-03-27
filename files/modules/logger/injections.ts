import type { Logger } from './types.js'
import { inject, provide } from '@files/modules/context/index.js'

const key = 'logger'

export function provideLogger(logger: Logger) {
    provide(key, logger)
}

export function useLogger() {
    return inject<Logger>(key)
}
