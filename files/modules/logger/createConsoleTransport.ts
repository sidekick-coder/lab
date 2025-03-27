import winston from 'winston'
import chalk from 'chalk'
import { printObject } from './printObject.js'

const { format } = winston

export function formatLog(data: any) {
    const { raw, level, message, timestamp, label, module, command, stack, ...rest } = data

    if (raw) {
        return message
    }

    let result = `${timestamp} ${level}`

    if (label) {
        result += ` ${label}`
    }

    if (command) {
        result += chalk.redBright(` [${command}]`)
    }

    if (module) {
        result += chalk.yellow(` [${module}]`)
    }

    result += `: ${message}`

    if (stack) {
        result += `\n${stack}`
    }

    if (Object.keys(rest).length > 0) {
        result += '\n' + chalk.gray(printObject(rest))
    }

    return result
}

export const formatter = format.combine(
    format.colorize({
        colors: {
            info: 'cyan',
            error: 'red',
            warn: 'yellow',
            debug: 'blue',
        },
    }),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(formatLog)
)

export function createConsoleTransport() {
    return new winston.transports.Console({
        format: formatter,
    })
}
