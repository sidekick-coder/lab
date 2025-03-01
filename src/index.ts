import { resolve } from 'path'
import { createCommander } from '@files/modules/commander/index.js'

const commander = createCommander({
    sources: {
        dirs: [resolve(import.meta.dirname, 'commands')],
    },
})

commander.handle(process.argv.slice(2))
