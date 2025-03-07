import { filesystem, shell } from '../utils/index.ts'

interface Button {
    name: string
    value: string
    color?: string
}

interface SelectOptions {
    title: string
    items: Button[]
}

export const system = {
    async select(options: SelectOptions) {
        const filename = filesystem.resolve(import.meta.url, 'scripts', 'buttons.ps1')
        const bin = 'powershell'
        const args = [
            filename,
            '-title',
            `'${options.title}'`,
            '-items',
            `'${JSON.stringify(options.items)}'`,
        ]

        const command = shell.execute(bin, args, {
            windowsHide: true,
        })

        await command.ready

        if (command.code !== 0) {
            console.error(command)
            throw new Error(command.stderr)
        }

        return command.stdout
    },
}
