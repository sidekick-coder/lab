import { commander } from './commander.js'

// add modules
import './modules/files/index.js'
import './modules/items/index.js'
import './modules/sources/index.js'

commander.handle(process.argv.slice(2))
