import { format } from 'date-fns'
import ms from 'ms'

export const formatDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd')
}

export const date = {
    format(value: Date | string, pattern = 'yyyy-MM-dd HH:mm:ss'): string {
        return format(value, pattern)
    },
    time(payload: Date | string) {
        const value = payload

        if (typeof value === 'string') {
            return new Date(value).getTime()
        }

        return value.getTime()
    },
    now() {
        return date.format(new Date())
    },
    future(value: number | string) {
        const timestamp = (typeof value === 'string' ? ms(value as any) : value) as number

        return date.format(new Date(Date.now() + timestamp))
    },
    isFuture(payload: Date | string) {
        const value = date.time(payload)

        return value > Date.now()
    },
    isBefore(a: Date | string, b: Date | string) {
        return date.time(a) < date.time(b)
    },
    diff(a: Date | string, b: Date | string, format = 'ms') {
        const milliseconds = date.time(a) - date.time(b)

        if (format === 'ms') {
            return milliseconds
        }

        return ms(milliseconds, { long: true })
    },
}
