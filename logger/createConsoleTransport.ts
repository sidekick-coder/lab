import winston from 'winston'
import chalk from 'chalk'

const { format } = winston
const { combine } = winston.format

export function createConsoleTransport() {
    return new winston.transports.Console({
        format: combine(
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
            format.printf((data) => {
                const { level, message, timestamp, label, module, command, stack, ...rest } = data

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

                for (const [key, value] of Object.entries(rest)) {
                    result += chalk.gray(`\n[${key}]: ${JSON.stringify(value)}`)
                }

                return result
            })
        ),
    })
}
