import * as prompts from '@inquirer/prompts'
import { system } from './system.ts'

export const prompter = {
    ...prompts,
    system,
}

export type Prompter = typeof prompts
