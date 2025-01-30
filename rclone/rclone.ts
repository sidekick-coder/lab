import { join } from 'path'
import { filesystem, shell } from '../utils/index.ts'
import type { RCloneConfig } from './createRClonePlugin'
import chalk from 'chalk'

export interface RCloneRunParams {
    config: RCloneConfig
    action?: string
    args?: string[]
    dryRun?: boolean
    disableDefaults?: boolean
    folders?: string[]
}

export async function rclone(action: string, args: string[], options: Record<string, any> = {}) {
    const bin = 'rclone'
    const all = [] as string[]

    all.push(action)
    all.push(...args)

    const entries = Object.entries(options)
        .map(([key, value]) => (Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]))
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

rclone.withConfig = async (
    config: RCloneConfig | RCloneConfig[],
    action: string,
    options: Record<string, any> = {}
) => {
    const configs = Array.isArray(config) ? config : [config]
    const { folder, ...rest } = options

    const systemFolders = ['$RECYCLE.BIN', 'System Volume Information', 'lost+found']

    const defaultExcludes = [
        'node_modules/**',
        'dist/**',
        '.git/**',
        '.cache/**',
        '*.{gdoc,gslides,gsheet}',
        '*desktop.ini',
    ]

    for await (const config of configs) {
        const directories = await filesystem.readdir(config.dir, {
            onlyDirectories: true,
        })

        for await (const directory of directories) {
            if (systemFolders.includes(directory)) continue

            if (folder && !folder.includes(directory)) {
                continue
            }

            const args = [join(config.dir, directory), `${config.remote}:${directory}`]

            const flags = {
                ...rest,
                exclude: defaultExcludes,
                verbose: true,
                color: 'NEVER',
            }

            await rclone(action, args, flags)
        }
    }
}
