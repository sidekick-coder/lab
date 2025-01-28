import { join } from 'path'
import { filesystem, shell } from '../utils/index.ts'
import type { RCloneConfig } from './createRClonePlugin'
import chalk from 'chalk'

export interface RCloneRunParams {
    config: RCloneConfig
    action?: 'sync' | 'check'
    disableDefaults?: boolean
    folders?: string[]
}

const commonFolderExcludes = ['$RECYCLE.BIN', 'System Volume Information', 'lost+found']

const commonRcloneExcludes = [
    'node_modules/**',
    'dist/**',
    '.git/**',
    '.cache/**',
    '*.{gdoc,gslides,gsheet}',
    '*desktop.ini',
]

export async function rclone(params: RCloneRunParams) {
    const config = params.config
    const action = params.action || 'sync'
    const disableDefaults = params.disableDefaults
    const folders = params.folders

    let directories = await filesystem.readdir(config.dir, {
        onlyDirectories: true,
    })

    if (folders) {
        directories = directories.filter((dir) => folders.includes(dir))
    }

    for await (const dir of directories) {
        const exclude = {
            folder: config.exclude?.folder ? config.exclude.folder.slice() : [],
            pattern: config.exclude?.pattern ? config.exclude.pattern.slice() : [],
        }

        if (!disableDefaults) {
            exclude.folder.push(...commonFolderExcludes)
            exclude.pattern.push(...commonRcloneExcludes)
        }

        if (exclude.folder.includes(dir)) continue

        if (folders && !folders.includes(dir)) continue

        if (!disableDefaults && commonFolderExcludes.includes(dir)) continue

        const bin = 'rclone'
        const args = [action, join(config.dir, dir), `${config.remote}:${dir}`]

        if (!disableDefaults) {
            commonRcloneExcludes.forEach((e) => args.push('--exclude', e))
        }

        console.log(
            chalk.grey(`[${action.toUpperCase()}] ${config.dir}:${dir} -> ${config.remote}:${dir}`)
        )
        console.log(chalk.grey('|---- exclude.folder', exclude.folder.join(', ')))
        console.log(chalk.grey('|---- exclude.pattern', exclude.pattern.join(', ')))

        const command = shell.execute(bin, args, {
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
}
