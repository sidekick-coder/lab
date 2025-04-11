export interface OptionBase {
    description?: string
    transform?: (value: string) => any
}

export interface OptionArg extends OptionBase {
    type: 'arg'
}

export interface OptionFlag extends OptionBase {
    type: 'flag'
    alias?: string[]
}

export type Option = OptionArg | OptionFlag

export type OptionRecord = Record<string, Option>

export function parse(options: OptionRecord, payload: string) {
    const result: Record<string, any> = {}

    const all: (Option & { key: string; name: string })[] = []

    for (const [key, value] of Object.entries(options)) {
        all.push({
            ...value,
            key: key,
            name: key,
        })

        if (value.type == 'flag' && value.alias) {
            value.alias.forEach((alias) => {
                all.push({
                    ...value,
                    key: alias,
                    name: key,
                })
            })
        }
    }

    const queue = payload.split(' ').slice()
    const argOptions = all.filter((opt) => opt.type === 'arg')
    const unknown: string[] = []

    while (queue.length) {
        const current = queue.shift()!

        if (current.startsWith('--')) {
            const flag = current.slice(2)
            const option = all.find((opt) => opt.key === flag)

            let value = queue.shift()

            if (!option) {
                unknown.push(current, value)
                continue
            }

            if (option.transform) {
                value = option.transform(value)
            }

            result[option.name] = value

            continue
        }

        if (current.startsWith('-')) {
            const flag = current.slice(1)
            const option = all.find((opt) => opt.key === flag)

            let value = queue.shift()

            if (!option) {
                unknown.push(current, value)
                continue
            }

            if (option.transform) {
                value = option.transform(value)
            }

            result[option.name] = value

            continue
        }

        const option = argOptions.shift()

        if (!option) {
            unknown.push(current)
            continue
        }

        let value = current

        if (option.transform) {
            value = option.transform(current)
        }

        result[option.key] = value
    }

    result['_unknown'] = unknown

    return result
}
