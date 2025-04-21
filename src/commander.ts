import { createCommander, createCommanderHelp } from '@/core/commander/index.js'

export const commander = createCommander({
    name: 'lab',
    bin: 'lab',
    defaultCommand: 'help',
})

commander.add(createCommanderHelp(commander))
