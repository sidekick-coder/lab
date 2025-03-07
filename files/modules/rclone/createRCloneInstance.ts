import { shell } from '@files/utils/shell.js'
import chalk from 'chalk'

export interface RCloneExludeOptions {
    folder?: string[]
    pattern?: string[]
}

export interface RCloneConfig {
    directory: string
    remote: string
    exclude?: RCloneExludeOptions
}

export type RCloneInstance = ReturnType<typeof createRCloneInstance>

export function createRCloneInstance() {
    async function run(action: string, args: string[], options: Record<string, any> = {}) {
        const bin = 'rclone'
        const all = [] as string[]

        all.push(action)
        all.push(...args)

        const entries = Object.entries(options)
            .map(([key, value]) =>
                Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
            )
            .flat()

        for (const [key, value] of entries) {
            if (typeof value === 'boolean') {
                all.push(`--${key}`)
                continue
            }

            all.push(`--${key}`, value)
        }

        console.log(chalk.grey(`|---- ${bin} ${all.join(' ')}`))

        const command = shell.execute(bin, all, {
            windowsHide: true,
            onStdout: (data: string) => {
                data.split('\n')
                    .filter((line) => line.trim().length > 0)
                    .forEach((line) => {
                        console.log(chalk.grey(`|---- ${line}`))
                    })
            },
            onStderr: (data: string) => {
                data.split('\n')
                    .filter((line) => line.trim().length > 0)
                    .forEach((line) => {
                        console.log(chalk.grey(`|---- ${line}`))
                    })
            },
        })

        await command.ready
    }

    return {
        run,
    }
}
