export interface FilesystemOptionsFs {
    exists: (path: string) => Promise<boolean>
    existsSync: (path: string) => boolean

    read: (path: string) => Promise<Uint8Array | null>
    readSync: (path: string) => Uint8Array | null

    readdir: (path: string) => Promise<string[]>
    readdirSync: (path: string) => string[]

    glob: (pattern: string) => Promise<string[]>
    globSync: (pattern: string) => string[]

    write: (path: string, content: Uint8Array) => Promise<void>
    writeSync: (path: string, content: Uint8Array) => void

    mkdir: (path: string) => Promise<void>
    mkdirSync: (path: string) => void

    copy: (source: string, target: string) => Promise<void>
    copySync: (source: string, target: string) => void

    remove: (path: string) => Promise<void>
    removeSync: (path: string) => void
    removeAt: (path: string, miliseconds: number) => Promise<boolean>

    [key: string]: any
}

export interface FilesystemOptionsPath {
    resolve: (...args: string[]) => string
    join: (...args: string[]) => string
    dirname: (args: string) => string
    basename: (args: string) => string
    relative: (from: string, to: string) => string
}

export interface FilesystemOptions {
    fs?: FilesystemOptionsFs
    path?: FilesystemOptionsPath
}
