import type { Config } from '@/types.js'
import { inject } from '@files/modules/context/index.js'
import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'

export function copyFile(source: string, target: string) {
    const config = inject<Config>('config')
    const filesystem = createFilesystem()
    let text = filesystem.readSync.text(source)

    let modulesAlias = '@/modules'
    let utilsAlias = '@/utils'

    if (config.modules?.alias) {
        modulesAlias = config.modules.alias
    }

    if (config.utils?.alias) {
        utilsAlias = config.utils.alias
    }

    text = text.replace(/@files\/utils/g, utilsAlias)
    text = text.replace(/@files\/modules/g, modulesAlias)

    filesystem.writeSync.text(target, text, {
        recursive: true,
    })
}
