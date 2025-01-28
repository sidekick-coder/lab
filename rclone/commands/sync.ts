import { defineCommand } from '../../commander/index.ts'
import type { RCloneConfig } from '../createRClonePlugin.ts'
import { rclone } from '../rclone.ts'

export default defineCommand({
    name: 'rclone:sync',
    async execute({ context, options, logger }) {
        const folders = options?.folders

        if (!Array.isArray(context?.rclone.configs)) {
            console.log('No configs found')
            return
        }

        const configs = context.rclone.configs as RCloneConfig[]

        if (configs.length === 0) {
            console.log('No configs found')
            return
        }

        for await (const config of configs) {
            await rclone({
                action: 'sync',
                config,
                folders: folders ? folders.split(',') : undefined,
            })

            logger.info('synced', {
                config,
                folders,
            })
        }
    },
})
