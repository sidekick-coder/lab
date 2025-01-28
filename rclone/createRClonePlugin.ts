import { definePlugin } from '../app/index.ts'
import { filesystem } from '../utils/filesystem.ts'

export interface RCloneExludeOptions {
    folder?: string[]
    pattern?: string[]
}

export interface RCloneConfig {
    dir: string
    remote: string
    exclude?: RCloneExludeOptions
}

export function createRClonePlugin(config: RCloneConfig | RCloneConfig[]) {
    const configs = Array.isArray(config) ? config : [config]

    return definePlugin({
        name: 'rclone',
        install({ commander, scheduler, context }) {
            commander.addDir(filesystem.resolve(import.meta.url, 'commands'))
            scheduler.addDir(filesystem.resolve(import.meta.url, 'routines'))

            context['rclone'] = {
                configs,
            }
        },
    })
}
