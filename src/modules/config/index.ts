import { createCommander } from '@/core/commander/index.js'
import { defineModule } from '@/utils/defineModule.js'
import { resolve } from 'path'

export default defineModule({
    name: 'config',
    description: 'Manage lab config',
    setup(lab) {
        const commander = createCommander({
            bin: `${lab.commander.config.bin} config`,
        })

        commander.addFolder(resolve(import.meta.dirname, 'commands'))

        lab.commander.addSubCommander('config', commander)
    },
})
