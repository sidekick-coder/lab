import Transport from 'winston-transport'
import { formatLog } from './createConsoleTransport.ts'

export class StreamRawTransport extends Transport {
    private _stream: NodeJS.WritableStream
    constructor(options: any = {}) {
        super(options)

        this._stream = options.stream
        this._stream.setMaxListeners(Infinity)
    }

    public log(info, callback) {
        process.env.FORCE_COLOR = '1'

        this._stream.write(formatLog(info) + '\n')

        if (callback) callback()
    }
}

export function createStreamRawTransport(options: any = {}) {
    return new StreamRawTransport(options)
}
