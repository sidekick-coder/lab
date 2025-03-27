export function printObject(object: any, indent: number = 0): string {
    let result = ''

    for (const key in object) {
        const value = object[key]

        if (indent > 0) {
            result += '|' + '-'.repeat(indent) + ' '
        }

        result += key + ': '

        if (typeof value === 'function') {
            result += '[Object Function]\n'
            continue
        }

        if (typeof value === 'object') {
            result += '\n' + printObject(value, indent + 2)
            continue
        }

        result += value + '\n'
    }

    return result
}
