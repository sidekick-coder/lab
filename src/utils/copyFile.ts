import type { Config } from '@/types.js'
import { inject } from '@files/modules/context/index.js'
import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'

export function copyFile(source: string, target: string) {
    const config = inject<Config>('config')
    const filesystem = createFilesystem()
    let text = filesystem.readSync.text(source)

    text = text.replace(/@files\/utils/g, config.utils?.path || '@/utils')
    text = text.replace(/@files\/modules/g, config.modules?.path || '@/modules')

    filesystem.writeSync.text(target, text, {
        recursive: true,
    })
}
