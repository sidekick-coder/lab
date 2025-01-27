import type winston from 'winston'

export interface LoggerConfig {
    filename?: string
    level?: string
}

export type Logger = winston.Logger
