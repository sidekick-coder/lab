import type { Commander } from '@/core/commander/index.js'

interface DefineModuleSetupPayload {
    commander: Commander
}
interface DefineModule {
    name: string
    description?: string
    setup?: (setup: DefineModuleSetupPayload) => void
}

export function defineModule(module: DefineModule) {
    return module
}
