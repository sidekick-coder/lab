import chalk from 'chalk'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export interface SectionItem {
    title: string
    description?: string
}

export interface Section {
    title: string
    description?: string
    items: SectionItem[]
}

export interface Options {
    title?: string
    description?: string
    sections?: Section[]
}

export function createHelpText(options: Options = {}) {
    const ui = require('cliui')({})

    const { title, description, sections = [] } = options

    if (title) {
        ui.div({
            text: title,
        })
    }

    if (description) {
        ui.div({
            text: description,
        })
    }

    for (const s of sections) {
        ui.div({
            text: chalk.cyan(s.title),
            padding: [1, 0, 0, 0],
        })

        if (s.description) {
            ui.div({
                text: s.description,
                padding: [0, 0, 1, 0],
            })
        }

        for (const item of s.items) {
            ui.div(
                {
                    text: item.title,
                    width: 50,
                    padding: [0, 2, 0, 2],
                },
                {
                    text: item.description || '',
                    padding: [0, 0, 0, 0],
                }
            )
        }
    }

    return ui.toString()
}
