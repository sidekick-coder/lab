import { provide } from '@files/modules/di/index.js'
import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'
import { merge } from 'lodash-es'
import { createRequire } from 'module'
import { commander } from './commander.js'

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

// add modules
filesystem
    .globSync(resolve(import.meta.dirname, 'modules', '**', 'index.*'))
    .forEach((filename) => require(filename))

commander.handle(process.argv.slice(2))
