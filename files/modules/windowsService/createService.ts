import type { ServiceConfig } from 'node-windows'
import { Service } from 'node-windows'

export function createService(options: ServiceConfig) {
    return new Service(options)
}
