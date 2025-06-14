import Table from 'cli-table3'

interface ObjectOptions {
    keyWidth?: number
}

export function object(output: any = {}, options: ObjectOptions = {}) {
    const screenWidth = process.stdout.columns || 80
    const keyWidth = options.keyWidth || Math.floor(screenWidth * 0.2)
    const valueWidth = Math.floor(screenWidth * 0.7)

    const table = new Table({
        wordWrap: true,
        wrapOnWordBoundary: false,
        colWidths: [keyWidth, valueWidth],
    })

    for (const key of Object.keys(output)) {
        table.push([key, String(output[key])])
    }

    console.log(table.toString())
}
