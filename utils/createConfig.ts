import { filesystem } from './filesystem.ts'

export function createConfig(filename: string, defaults: Record<string, any>) {
    let config = defaults

    const json = filesystem.readSync.json(filename)

    if (json) {
        config = json
    }

    // watch for changes
    //
    const proxy = new Proxy(config, {
        set(target, key, value) {
            target[key as string] = value

            filesystem.writeSync.json(filename, target, {
                recursive: true,
            })

            return true
        },
    })

    return proxy
}
