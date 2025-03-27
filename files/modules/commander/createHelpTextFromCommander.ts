import type { Commander } from './createCommander.js'
import { createHelpText, type Section } from './createHelpText.js'

export interface Options {
    title?: string
    description?: string
    extraSections?: Section[]
}

export function createHelpTextFromCommander(commander: Commander, options: Options = {}) {
    const sections = [] as Section[]

    const uncategorized = commander.commands
        .filter((c) => !c.category)
        .map((c) => ({
            title: c.name,
            description: c.description,
        }))

    sections.push({
        title: 'Commands',
        items: uncategorized,
    })

    const categories = commander.commands
        .filter((c) => c.category)
        .map((c) => c.category)
        .flat()
        .filter((value, index, self) => self.indexOf(value) === index)

    for (const category of categories) {
        const categoryCommands = commander.commands
            .filter((c) => c.category === category)
            .map((c) => ({
                title: c.name,
                description: c.description,
            }))

        sections.push({
            title: category,
            items: categoryCommands,
        })
    }

    const title = options.title || ''
    const description = options.description

    if (options.extraSections) {
        sections.push(...options.extraSections)
    }

    return createHelpText({
        title,
        description,
        sections,
    })
}
