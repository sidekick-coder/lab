import * as valibot from 'valibot'
import * as extras from './extras.js'

export type Valibot = typeof valibot

export interface ValibotExtended extends Valibot {
    extras: typeof extras
}

export const v = {
    ...valibot,
    extras,
}
