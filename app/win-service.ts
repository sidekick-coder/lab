import { Service } from 'node-windows'
import { inject, provide } from '../provide-inject/index.ts'

const key = 'win-service'

interface Options {
    name: string
    description: string
    script: string
    nodeOptions?: string[]
    scriptOptions?: string[]
    env?: Record<string, string>
}

export function provideService(options: Options) {
    const service = new Service(options)

    provide(key, service)
}

export function useService() {
    const service = inject<Service>(key)

    if (!service) {
        throw new Error('Service not provided')
    }

    return service
}
