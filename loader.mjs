import { resolve as originalResolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function resolve(specifier, context, defaultResolve) {
    if (specifier.startsWith('@lab')) {
        const aliasPath = originalResolve(import.meta.dirname, 'dist')
        const relativePath = specifier.replace('@lab', '.')
        const absolutePath = originalResolve(aliasPath, relativePath)
        return {
            url: pathToFileURL(absolutePath).toString(),
            shortCircuit: true,
        }
    }
    return defaultResolve(specifier, context, defaultResolve)
}
