import { v } from '@files/modules/validator/index.js'
import { transform } from './transform.js'

export const definition = () =>
    v.object({
        dirs: v.optional(v.extras.array(v.string()), []),
        files: v.optional(v.extras.array(v.string()), []),
        patterns: v.optional(v.extras.array(v.string()), []),
        items: v.optional(v.array(v.any()), []),
    })

export const schema = () => v.pipe(definition(), v.transform(transform), v.array(v.string()))
