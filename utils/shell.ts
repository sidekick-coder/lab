import { spawn } from 'child_process'

function execute(bin: string, args: string[], options?: any) {
    const state = {
        stdout: '',
        stderr: '',
        code: null as null | number,
        done: false,
        ready: null as null | Promise<any>,
    }

    const child = spawn(bin, args, {})

    child.stdout.on('data', function (data) {
        data = data.toString().trim()

        if (options?.onStdout) {
            options.onStdout(data)
        }

        state.stdout += data
    })

    child.stderr.on('data', function (data) {
        data = data.toString().trim()

        if (options?.onStderr) {
            options.onStderr(data)
        }

        state.stderr += data
    })

    child.on('close', function (code) {
        state.done = true
        state.code = code

        if (options?.onClose) {
            options.onClose(state)
        }
    })

    state.ready = new Promise((resolve) => {
        const interval = setInterval(() => {
            if (state.done) {
                clearInterval(interval)
                resolve(state)
            }
        }, 100)
    })

    return state
}

export const shell = {
    execute,
}
