import type { Service } from 'node-windows'
import { type Command, definePlugin, useFlags } from '@files/modules/commander/index.js'
import { useFilesystem } from '@files/modules/filesystem/index.js'
import { shell } from '@files/utils/shell.js'

interface Options {
    name?: string
}

export function createCommanderPlugin(service: Service, options?: Options) {
    const commands = [] as Command[]

    commands.push({
        name: 'win:install',
        description: 'Install a windows service to run the script',
        categories: ['Windows'],
        execute: async () => {
            service.on('install', () => {
                service.start()

                console.log('service installed')
            })

            service.install()
        },
    })

    commands.push({
        name: 'win:uninstall',
        description: 'Uninstall the windows service',
        categories: ['Windows'],
        execute: async () => {
            service.on('uninstall', () => {
                console.log('service uninstalled')
            })

            service.uninstall()
        },
    })

    commands.push({
        name: 'win:logs',
        categories: ['Windows'],
        async execute() {
            const id = (service as any).id
            const filesystem = useFilesystem()
            const resolve = filesystem.path.resolve
            const filename = resolve(service.root, `${id}.out.log`)
            //
            if (!(await filesystem.exists(filename))) {
                console.log('file not found:', filename)
                return
            }

            const flags = useFlags({
                length: {
                    description: 'Number of lines to read',
                },
                tail: {
                    description: 'Tail the file',
                },
            })

            const args = ['Get-Content', filename]

            args.push('-Tail', flags.length || 30)

            if (flags.tail) {
                args.push('-Wait')
            }

            const { child } = shell.execute('powershell', args)

            child.stdout?.pipe(process.stdout)
            child.stderr?.pipe(process.stderr)
        },
    })

    return definePlugin({
        name: options?.name || 'win-service',
        type: 'command-list',
        commands,
    })
}
