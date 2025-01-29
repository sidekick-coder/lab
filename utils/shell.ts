import { spawn } from 'child_process'

function execute(bin: string, args: string[], options: any = {}) {
    const state = {
        stdout: '',
        stderr: '',
        code: null as null | number,
        done: false,
        ready: null as null | Promise<any>,
        child: null as null | any,
    }

    const { onStdout, onStderr, onClose, ...rest } = options

    const child = spawn(bin, args, rest)

    child.stdout?.on('data', function (data) {
        data = data.toString().trim()

        if (onStdout) {
            onStdout(data)
        }

        state.stdout += data
    })

    child.stderr?.on('data', function (data) {
        data = data.toString().trim()

        if (onStderr) {
            onStderr(data)
        }

        state.stderr += data
    })

    child.on('close', function (code) {
        state.done = true
        state.code = code

        if (onClose) {
            onClose(state)
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

    state.child = child

    return state
}

export const shell = {
    execute,
}
