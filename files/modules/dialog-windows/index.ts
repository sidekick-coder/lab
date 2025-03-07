import * as prompts from '@inquirer/prompts'

export const prompter = {
    ...prompts,
}

export type Prompter = typeof prompts
