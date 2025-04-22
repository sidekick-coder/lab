import { createCommander, createCommanderHelp } from '@/core/commander/index.js'
import { commander as rootCommander } from '@/commander.js'
import read from './commands/read.js'

const commander = createCommander()

rootCommander.addSubCommander('files', commander)

commander.add(createCommanderHelp(commander))

commander.add(read)
