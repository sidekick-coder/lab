import winston from 'winston'
import { createConsoleTransport } from './createConsoleTransport.js'
import { createFileTransport } from './createFileTransport.js'
import type { LoggerConfig } from './types.js'

export function createLogger(config: LoggerConfig) {
    const transports: winston.transport[] = [createConsoleTransport()]

    if (config.filename) {
        transports.push(createFileTransport(config.filename))
    }

    return winston.createLogger({
        level: config.level || 'info',
        transports,
    })
}
