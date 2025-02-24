const state = new Map<string, any>()

export function provide(key: string, value: any) {
    state.set(key, value)
}

export function inject<T>(key: string) {
    return state.get(key) as T | undefined
}
