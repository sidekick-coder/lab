#! /usr/bin/env node
import { createRequire } from 'module'
import path from 'path'
import cp from 'child_process'

const require = createRequire(import.meta.url)

require('dotenv').config({
    path: path.resolve(import.meta.dirname, '.env'),
})

const isDev = process.env.NODE_ENV == 'development'

const args = []
const NODE_OPTIONS = []
const envVars = { ...process.env }

args.push(
    isDev
        ? path.resolve(import.meta.dirname, 'src/index.ts')
        : path.resolve(import.meta.dirname, 'dist/index.js')
)

NODE_OPTIONS.push('--disable-warning', 'ExperimentalWarning')

if (isDev) {
    NODE_OPTIONS.push('--import', 'file://' + require.resolve('tsx/esm'))

    envVars.TSX_TSCONFIG_PATH = path.join(import.meta.dirname, 'tsconfig.json')
}

args.push(...process.argv.slice(2))

cp.spawn('node', args, {
    stdio: 'inherit',
    env: {
        ...envVars,
        NODE_OPTIONS: NODE_OPTIONS.join(' '),
    },
})
