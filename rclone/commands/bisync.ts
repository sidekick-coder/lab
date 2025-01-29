import { defineCommand } from '../../commander/index.ts'
import type { RCloneConfig } from '../createRClonePlugin.ts'
import { rclone } from '../rclone.ts'

export default defineCommand({
    name: 'rclone:bisync',
    async execute({ context, options }) {
        if (!Array.isArray(context.rclone?.configs)) {
            console.log('No configs found')
            return
        }

        const configs = context.rclone.configs as RCloneConfig[]

        if (configs.length === 0) {
            console.log('No configs found')
            return
        }

        //return rclone.withConfig(configs, 'sync', options)
    },
})
