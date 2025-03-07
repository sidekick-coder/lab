import { shell } from '@files/utils/shell.js'
import chalk from 'chalk'
import { createFilesystem } from '../filesystem/createFilesystem.js'

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

export function createRCloneInstance(config: RCloneConfig | RCloneConfig[]) {
    const filesystem = createFilesystem()
    const join = filesystem.path.join

    const configs = Array.isArray(config) ? config : [config]

    async function raw(action: string, args: string[], options: Record<string, any> = {}) {
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

    async function run(action: string, options: Record<string, any> = {}) {
        const { folder, ...rest } = options

        const systemFolders = [
            '$RECYCLE.BIN',
            'System Volume Information',
            'lost+found',
            'Recovery',
        ]

        const defaultExcludes = [
            'node_modules/**',
            'dist/**',
            '.git/**',
            '.cache/**',
            '*.{gdoc,gslides,gsheet}',
            '*desktop.ini',
        ]

        for await (const config of configs) {
            const directories = await filesystem.readdir(config.directory, {
                onlyDirectories: true,
            })

            for await (const directory of directories) {
                if (systemFolders.includes(directory)) continue

                if (folder && !folder.includes(directory)) {
                    continue
                }

                const args = [join(config.directory, directory), `${config.remote}:${directory}`]

                const allExcludes = defaultExcludes.slice()

                if (config.exclude?.pattern) {
                    allExcludes.push(...config.exclude.pattern)
                }

                const flags = {
                    ...rest,
                    exclude: allExcludes,
                    color: 'NEVER',
                }

                await raw(action, args, flags)
            }
        }
    }

    return {
        configs,
        raw,
        run,
    }
}
