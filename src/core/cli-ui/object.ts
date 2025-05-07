import Table from 'cli-table3'

export function object(output: any = {}) {
    const screenWidth = process.stdout.columns || 80

    const table = new Table({
        wordWrap: true,
        wrapOnWordBoundary: false,
        colWidths: [Math.floor(screenWidth * 0.2), Math.floor(screenWidth * 0.7)],
    })

    for (const key of Object.keys(output)) {
        table.push([key, output[key]])
    }

    console.log(table.toString())
}
