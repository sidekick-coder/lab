import { createCommander } from '@files/modules/commander/index.js'
import { provide } from '@files/modules/context/index.js'
import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'
import { merge } from 'lodash-es'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const config = {
    baseDir: process.cwd(),
}

const filesystem = createFilesystem()
const resolve = filesystem.path.resolve

if (filesystem.existsSync(resolve(process.cwd(), 'lab.config.js'))) {
    const fileModule = require(resolve(process.cwd(), 'lab.config.js'))

    merge(config, fileModule.default)
}

provide('config', config)

const commander = createCommander({
    sources: {
        dirs: [resolve(import.meta.dirname, 'commands')],
    },
})

commander.handle(process.argv.slice(2))
