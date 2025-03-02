export interface SourceItemFile {
    filename: string
    dirname: string
    data: any
}

export interface SourceItemData {
    data: any
}

export type SourceItem = SourceItemFile | SourceItemData

export interface SourceOptions {
    items?: any[]
    files?: string[]
    dirs?: string[]
    patterns?: string[]
    baseDir?: string
}
