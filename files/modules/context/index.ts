interface Item {
    current: string
    values: any[]
}

const state = new Map<string, Item>()

const opened = ['global'] as string[]

class ContextError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ContextError'
    }
}

export function createKey() {
    return Math.random().toString(36).slice(2)
}

export function open(name?: string) {
    opened.push(name || createKey())
}

export function close() {
    if (opened.length === 1) {
        throw new ContextError('Cannot close global context')
    }

    Array.from(state.entries()).forEach(([key, item]) => {
        if (item.current === opened.at(-1)) {
            item.values.pop()
        }

        item.current = opened.at(-2)

        state.set(key, item)
    })

    opened.pop()
}

export function provide(name: string, value: any) {
    let item = state.get(name)

    if (!item) {
        item = {
            current: opened.at(-1),
            values: [],
        }
    }

    item.values.push(value)

    state.set(name, item)
}

export function inject<T = any>(name: string): T {
    const item = state.get(name)

    if (!item) {
        throw new ContextError(`Injection failed, "${name}" not found in context`)
    }

    return item.values.at(-1)
}
