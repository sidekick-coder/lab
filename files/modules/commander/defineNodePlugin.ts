import { defineBinPlugin } from './defineBinPlugin.js'

interface Options {
    name: string
    path: string
    manifest?: string
}

export function defineNodePlugin(options: Options) {
    return defineBinPlugin({
        name: options.name,
        bin: 'node',
        args: [options.path],
        manifest: options.manifest,
    })
}
