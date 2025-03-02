import { definePlugin } from './definePlugin.js'
import cp from 'child_process'

interface Options {
    name: string
    path: string
}

export function defineNodePlugin(options: Options) {
    return definePlugin({
        name: options.name,
        execute(args) {
            return new Promise<void>((resolve, reject) => {
                const child = cp.spawn('node', [options.path, ...args], {
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
