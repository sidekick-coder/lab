import { createCommander } from '@/core/commander/index.js'
import { defineModule } from '@/utils/defineModule.js'
import { resolve } from 'path'

export default defineModule({
    name: 'files',
    description: 'Manage files',
    setup(lab) {
        const commander = createCommander({
            bin: `${lab.commander.config.bin} files`,
        })

        commander.addFolder(resolve(import.meta.dirname, 'commands'))

        lab.commander.addSubCommander('files', commander)
    },
})
