import { createCommander } from '@/core/commander/index.js'
import { defineModule } from '@/utils/defineModule.js'
import { resolve } from 'path'

export default defineModule({
    name: 'sources',
    description: 'Manage sources',
    setup(lab) {
        const commander = createCommander()

        commander.addFolder(resolve(import.meta.dirname, 'commands'))

        lab.commander.addSubCommander('sources', commander)
    },
})
