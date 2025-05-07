import os from 'os'
import { filesystem, parsers, transforms } from '@/filesystem.js'

const config = {
    sources: [],
}

const resolve = filesystem.path.resolve
const filename = resolve(os.homedir(), '.sidekick-coder-lab', 'config.json')

const json = filesystem.readSync(filename, {
    transform: transforms.json,
})

if (json) {
    Object.assign(config, json)
}

export default new Proxy(config, {
    set(target, prop, value) {
        target[prop] = value

        filesystem.writeSync(filename, parsers.json(config))

        return true
    },
})
