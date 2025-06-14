import { createCommander, createCommanderHelp } from '@/core/commander/index.js'
import files from './modules/files/index.js'
import sources from './modules/sources/index.js'
import items from './modules/items/index.js'

export const commander = createCommander({
    name: 'lab',
    bin: 'lab',
    defaultCommand: 'help',
})

commander.add(createCommanderHelp(commander))

const labs = [files, sources, items]

for (const lab of labs) {
    lab.setup({ commander })
}

// add modules
//import './modules/files/index.js'
//import './modules/items/index.js'
//import './modules/sources/index.js'

commander.handle(process.argv.slice(2))
