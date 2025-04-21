import { createCommander, createCommanderHelp } from '@/core/commander/index.js'
import { commander as rootCommander } from '@/commander.js'
import list from './commands/list.js'
import create from './commands/create.js'
import destroy from './commands/destroy.js'

const commander = createCommander()

rootCommander.addSubCommander('sources', commander)

commander.add(createCommanderHelp(commander))

commander.add(list, create, destroy)
