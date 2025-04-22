export async function findManifestByUrl(uri: string) {
    const url = new URL(uri)

    const hostname = url.hostname

    if (hostname === 'github.com') {
        const manifestUrl = `https://raw.githubusercontent.com${url.pathname}/HEAD/manifest.json`

        const response = await fetch(manifestUrl)
        const manifest = await response.json()

        return manifest
    }

    throw new Error(`Unsupported URL: ${uri}`)
}
