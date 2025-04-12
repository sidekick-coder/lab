export interface ConfigUtils {
    alias?: string
}

export interface ConfigModules {
    alias?: string
    dir?: string
}

export interface Config {
    baseDir: string
    utils?: ConfigUtils
    modules?: ConfigModules
}
