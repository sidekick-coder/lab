import { defineCommand } from '@files/modules/commander/defineCommand.js'

export default defineCommand({
    name: 'add:util',
    description: 'Add a new utility command',
    execute() {
        conosle.log('add:util')
    },
})
