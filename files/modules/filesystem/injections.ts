import type { Filesystem } from './createFilesystem.js'
import { inject, provide } from '@files/modules/context/index.js'

const key = 'filesystem'

export function provideFilesystem(filesystem: Filesystem) {
    provide(key, filesystem)
}

export function useFilesystem() {
    return inject<Filesystem>(key)
}
