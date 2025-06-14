import { join } from 'path'
import YAML from 'yaml'
import fs from 'fs'
import { homedir } from 'os'

export default class ConfigRepository {
    public async list() {
        const files = [join(homedir(), '.lab', 'config.yml'), join(process.cwd(), 'lab.config.yml')]

        const configs = []

        for (const file of files) {
            const config = {
                path: file,
                exists: false,
            }

            if (fs.existsSync(file)) {
                const content = YAML.parse(fs.readFileSync(file, 'utf8'))
                config.exists = true

                Object.assign(config, content)
            }

            configs.push(config)
        }

        return configs
    }
}
