import { expect, it, vi } from 'vitest'
import { createCommander } from './createCommander.js'

it('should run commander', async () => {
    const commander = createCommander()

    const execute = vi.fn()

    commander.add({
        name: 'hello',
        execute,
    })

    await commander.handle(['hello'])

    expect(execute).toHaveBeenCalled()
})

it('should run sub commander', async () => {
    const commander = createCommander()
    const subCommander = createCommander()

    const execute = vi.fn()

    commander.addSubCommander('sub', subCommander)

    subCommander.add({
        name: 'hello',
        execute,
    })

    await commander.handle(['sub', 'hello'])

    expect(execute).toHaveBeenCalled()
})
