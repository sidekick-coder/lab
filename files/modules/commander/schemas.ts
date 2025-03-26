import { v } from '@files/modules/validator/index.js'
import type { InferOutput } from 'valibot'

export type Config = InferOutput<typeof config>

export const config = v.object({
    name: v.optional(v.string()),
    defaultCommand: v.optional(v.string(), 'help'),
})
