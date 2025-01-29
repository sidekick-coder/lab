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
    add(value: Date | string, interval: string) {
        const timestamp = (typeof interval === 'string' ? ms(interval) : interval) as number

        return date.format(new Date(date.time(value) + timestamp))
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
    diff<T extends 'miliseconds' | 'seconds' | 'minutes' | 'ms'>(
        a: Date | string,
        b: Date | string,
        format: T
    ): T extends 'ms' ? string : number {
        const milliseconds = date.time(a) - date.time(b)

        if (format === 'seconds') {
            return (milliseconds / 1000) as any
        }

        if (format === 'minutes') {
            return (milliseconds / 1000 / 60) as any
        }

        if (format === 'ms') {
            return ms(milliseconds, { long: true }) as any
        }

        return milliseconds as any
    },
}
