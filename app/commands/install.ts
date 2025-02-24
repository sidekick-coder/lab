import { defineCommand } from '../../commander/defineCommand.ts'
import { useService } from '../win-service.ts'

export default defineCommand({
    name: 'install',
    execute: ({ logger }) => {
        const service = useService()

        service.on('install', () => {
            service.start()

            logger.info('service installed')
        })

        service.install()
    },
})
