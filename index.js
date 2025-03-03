#! /usr/bin/env node
import { createRequire } from 'module'
import path from 'path'
import { register } from 'tsx/esm/api'

const require = createRequire(import.meta.url)

require('dotenv').config({
    path: path.join(import.meta.dirname, '.env'),
})

const isDev = process.env.NODE_ENV === 'development'

if (!isDev) {
    require('./dist/index.js')
}

if (isDev) {
    register({
        tsconfig: path.join(import.meta.dirname, 'tsconfig.json'),
    })

    require('./src/index.ts')
}
