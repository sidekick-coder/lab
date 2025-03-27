import type { Commander } from './createCommander.js'
import { createHelpText, type Section } from './createHelpText.js'
import { createHelpTextFromCommander } from './createHelpTextFromCommander.js'
import { defineCommand } from './defineCommand.js'

interface Options {
    title?: string
    description?: string
    extraSections?: Section[]
}

export function createCommanderHelp(commander: Commander, options: Options = {}) {
    return defineCommand({
        name: 'help',
        description: 'Display help information for commands',
        execute: async () => {
            const sections = [] as Section[]
            const bin = commander.options.bin

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

            // sub commanders
            for (const [title, c] of commander.getSubcommaners().entries()) {
                const items = c.commands.map((c) => ({
                    title: c.name,
                    description: c.description,
                }))

                let description = ''

                if (commander.options.bin) {
                    description += `Usage: ${bin} ${title} [COMMAND] [OPTIONS]`
                }

                sections.push({
                    title,
                    description,
                    items,
                })
            }

            const title = options.title || `Usage: ${bin} [COMMAND] [OPTIONS]`
            const description = options.description

            if (options.extraSections) {
                sections.push(...options.extraSections)
            }

            const text = createHelpText({
                title,
                description,
                sections,
            })

            console.log(text)
        },
    })
}
