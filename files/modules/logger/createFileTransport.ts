import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const { format } = winston
const { combine, timestamp } = winston.format

export function createFileTransport(filename: string) {
    return new DailyRotateFile({
        filename: filename,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: combine(timestamp(), format.uncolorize(), format.json()),
    })
}
