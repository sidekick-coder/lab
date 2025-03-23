import { definePlugin } from './definePlugin.js'
import cp from 'child_process'

interface Options {
    name: string
    bin: string
    args?: string[]
    manifest?: string
}

export function defineBinPlugin(options: Options) {
    return definePlugin({
        name: options.name,
        type: 'execute',
        manifest: options.manifest,
        execute(args) {
            return new Promise<void>((resolve, reject) => {
                const allArgs: string[] = []

                if (options.args) {
                    allArgs.push(...options.args)
                }

                allArgs.push(...args)

                const child = cp.spawn(options.bin, allArgs, {
                    stdio: 'inherit',
                })

                child.on('close', (code) => {
                    if (code === 0) {
                        return resolve()
                    }

                    reject(new Error(`Process exited with code ${code}`))
                })
            })
        },
    })
}
