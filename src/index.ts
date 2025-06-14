import { createCommander } from '@/core/commander/index.js'
import fs from 'fs'
import files from './modules/files/index.js'
import sources from './modules/sources/index.js'
import items from './modules/items/index.js'
import config from './modules/config/index.js'
import ConfigRepository from './modules/config/ConfigRepository.js'
import { tryCatch } from './utils/tryCatch.js'
import { resolve } from 'path'
import { pathToFileURL } from 'url'

function importModule(filename: string) {
    const url = pathToFileURL(filename)

    return import(url.href)
}

async function main() {
    const commander = createCommander({
        name: 'lab',
        bin: 'lab',
        defaultCommand: 'help',
    })

    commander.addFolder(resolve(import.meta.dirname, 'commands'))

    const labs = [config]

    // config
    const configRepository = new ConfigRepository()

    const configs = await configRepository.list()
    const configLabs = configs.map((config) => config.labs || []).flat()

    const namedLabs = {
        files,
        sources,
        items,
    }

    for (const lab of configLabs) {
        if (namedLabs[lab]) {
            labs.push(namedLabs[lab])
            continue
        }

        const exists = fs.existsSync(lab)

        if (!exists) {
            console.warn(`[lab] lab module "${lab}" does not exist. Skipping...`)
            continue
        }

        const [error, labModule] = await tryCatch(() => importModule(lab))

        if (error) {
            console.error(`[lab] Failed to load lab module "${lab}":`, error)
            continue
        }

        labs.push(labModule.default || labModule)
    }

    // pwd lab
    if (fs.existsSync(resolve(process.cwd(), 'lab.mjs'))) {
        const [error, pwdLab] = await tryCatch(() =>
            importModule(resolve(process.cwd(), 'lab.mjs'))
        )

        if (error) {
            console.error('[lab] Failed to load local lab module:', error)
        }

        if (!error && pwdLab.default) {
            labs.push(pwdLab.default)
        }
    }

    for (const lab of labs) {
        lab.setup({ commander })
    }

    commander.handle(process.argv.slice(2))
}

main().catch((error) => {
    console.error('Error:', error)
    process.exit(1)
})
