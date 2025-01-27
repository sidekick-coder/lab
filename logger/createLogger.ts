import winston from 'winston'
import { createConsoleTransport } from './createConsoleTransport.ts'
import { createFileTransport } from './createFileTransport.ts'
import type { LoggerConfig } from './types.ts'

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
