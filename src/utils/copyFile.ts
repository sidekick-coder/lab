import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'

interface Option {
    baseDir: string
}

export function copyFile(source: string, target: string, options: Option) {
    const filesystem = createFilesystem()
    let text = filesystem.readSync.text(source)

    text = text.replace(/@files\/utils/g, '@/utils')
    text = text.replace(/@files\/modules/g, '@/modules')

    filesystem.writeSync.text(target, text, {
        recursive: true,
    })
}
