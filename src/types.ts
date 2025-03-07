export interface ConfigUtils {
    path?: string
}

export interface ConfigModules {
    path?: string
}

export interface Config {
    baseDir: string
    utils?: ConfigUtils
    modules?: ConfigModules
}
