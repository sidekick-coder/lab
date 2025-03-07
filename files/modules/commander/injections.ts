import type { Commander } from './createCommander.js'
import { inject, provide } from '@files/modules/context/index.js'

const key = 'commander'

export function provideCommander(commander: Commander) {
    provide(key, commander)
}

export function useCommander() {
    return inject<Commander>(key)
}
