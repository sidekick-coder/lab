import * as v from 'valibot'
import { useFilesystem } from '@files/modules/filesystem/index.js'

export const filename = (cwd = '') => {
    const filesystem = useFilesystem()
    const resolve = filesystem.path.resolve

    return v.pipe(
        v.string(),
        v.transform((value) => resolve(cwd, value))
    )
}

export const glob = (cwd = '') => {
    const filesystem = useFilesystem()

    return v.pipe(
        filename(cwd),
        v.transform((value) => filesystem.globSync(value))
    )
}

export const fs = {
    filename,
    glob,
}
