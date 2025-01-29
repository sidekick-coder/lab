import { defineCommand } from '../../commander/index.ts'
import { shell } from '../../utils/shell.ts'

export default defineCommand({
    name: 'rclone',
    async execute({ colors, options }) {
        const bin = 'rclone'
        const args = [] as string[]
        const { action, ...rest } = options

        if (!action) {
            console.log(colors.red('No action provided'))
            return
        }

        args.push(action)

        for (const [key, value] of Object.entries(rest)) {
            args.push(`--${key}`, value)
        }

        console.log(colors.grey(`|---- ${bin} ${args.join(' ')}`))

        const command = shell.execute(bin, args, {
            onStdout: (data: string) => {
                data.split('\n')
                    .filter((line) => line.trim().length > 0)
                    .forEach((line) => {
                        console.log(colors.grey(`|---- ${line}`))
                    })
            },
            onStderr: (data: string) => {
                data.split('\n')
                    .filter((line) => line.trim().length > 0)
                    .forEach((line) => {
                        console.log(colors.grey(`|---- ${line}`))
                    })
            },
        })

        await command.ready
    },
})
