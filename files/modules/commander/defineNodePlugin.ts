import { defineBinPlugin } from './defineBinPlugin.js'

interface Options {
    name: string
    path: string
}

export function defineNodePlugin(options: Options) {
    return defineBinPlugin({
        name: options.name,
        bin: 'node',
        args: [options.path],
    })
}
