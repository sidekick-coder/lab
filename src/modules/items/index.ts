import { createCommander, createCommanderHelp } from '@/core/commander/index.js'
import { commander as rootCommander } from '@/commander.js'
import list from './commands/list.js'
import add from './commands/add.js'

const commander = createCommander()

rootCommander.addSubCommander('items', commander)

commander.add(createCommanderHelp(commander))

commander.add(list, add)
