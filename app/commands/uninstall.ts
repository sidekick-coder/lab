import { defineCommand } from '../../commander/defineCommand.ts'
import { useService } from '../win-service.ts'

export default defineCommand({
    name: 'uninstall',
    execute: ({ logger }) => {
        const service = useService()

        service.on('uninstall', () => {
            logger.info('service uninstalled')
        })

        service.uninstall()
    },
})
