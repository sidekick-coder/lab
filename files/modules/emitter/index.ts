interface Observer {
    name: string
    callback: Function
}
export function createEmitter() {
    const observers = [] as Observer[]

    function on(name: string, callback: Function) {
        observers.push({ name, callback })
    }

    function off(name: string, callback: Function) {
        const index = observers.findIndex((o) => o.name === name && o.callback === callback)

        if (index !== -1) {
            observers.splice(index, 1)
        }
    }

    function emit(name: string, ...args: any[]) {
        observers.forEach((o) => {
            if (o.name === name) {
                o.callback(...args)
            }
        })
    }

    return {
        on,
        off,
        emit,
    }
}
