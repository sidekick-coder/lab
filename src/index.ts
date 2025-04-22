import { createRequire } from 'module'
import { commander } from './commander.js'
import { filesystem } from './filesystem.js'

const require = createRequire(import.meta.url)
const resolve = filesystem.path.resolve

// add modules
filesystem
    .globSync(resolve(import.meta.dirname, 'modules', '**', 'index.*'))
    .forEach((filename) => require(filename))

commander.handle(process.argv.slice(2))
