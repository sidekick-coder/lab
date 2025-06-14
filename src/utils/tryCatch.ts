interface Tryer {
    (...args: any[]): any
}

interface TryerAsync {
    (...args: any[]): Promise<any>
}

type TryCatchResult<T extends Tryer> = [null, ReturnType<T>] | [Error, null]

type TryCatchAsyncResult<T extends TryerAsync> = [null, Awaited<ReturnType<T>>] | [Error, null]

export async function tryCatch<T extends TryerAsync>(tryer: T): Promise<TryCatchAsyncResult<T>> {
    try {
        const result = await tryer()
        return [null, result]
    } catch (error) {
        return [error, null]
    }
}

tryCatch.sync = function <T extends Tryer>(tryer: T): TryCatchResult<T> {
    try {
        const result = tryer()
        return [result, null]
    } catch (error) {
        return [null, error]
    }
}
