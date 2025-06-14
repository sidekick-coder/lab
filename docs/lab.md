# Lab Registration Guide

Labs are JavaScript files that can register subcommanders, allowing you to extend the lab CLI. You can run these commands using the following syntax:

```
lab [subcommander] [command]
```

This enables you to build modular and flexible CLI workflows tailored to your needs.

## 1. Initializing a Lab

To create a new lab in your current directory, use the `init` command:

```sh
node index.js init [name]
```
- If you omit `[name]`, you will be prompted to enter a lab name.
- This command generates a `tsconfig.json`, a `lab.mjs` file, and a sample command using templates.

### 1.1 lab.mjs
The `lab.mjs` file is the main entry point for your lab. It registers your lab and its subcommanders, and sets up the CLI structure. You can add or organize commands by modifying this file.

#### Example
```js
import { createCommander } from '@lab/core/commander/index.js'
import { defineLab } from '@lab/utils/index.js'
import { resolve } from 'path'

const name = 'my-lab'

export default defineLab({
    name,
    setup(lab) {
        const commander = createCommander({
            bin: `${lab.commander.bin} ${name}`,
        })
        commander.addFolder(resolve(import.meta.dirname, './commands'))
        lab.commander.addSubCommander(name, commander)
    },
})
```

### 1.2 tsconfig.json
The `tsconfig.json` file configures TypeScript for your lab, setting up path aliases and type roots to ensure your code is type-checked and modules are resolved correctly. The file paths in this configuration are absolute and map to where the lab package is installed. This is done to allow editors (like VS Code) to correctly resolve types and modules, providing a better development experience with features like autocompletion and type checking.

#### Example
```json
{
  "extends": "<lab_install_path>/tsconfig.lab.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@lab/*": ["<lab_install_path>/src/*"]
    },
    "types": ["<lab_install_path>/node_modules/@types/node"]
  }
}
```

### 1.3 Sample Command
A sample command is generated in the `commands` folder to help you get started. You can run it with:

```sh
lab my-lab hello
```

#### Example: commands/hello.mjs
```js
import { defineCommand } from '@lab/core/commander/index.js'

export default defineCommand({
    name: 'hello',
    description: 'Prints Hello, World!',
    async execute() {
        console.log('Hello, World!')
    },
})
```

## 2. Registering Global Labs in Home Config

Labs can be registered globally by adding their paths as strings to your home config file, typically located at:

```
~/.lab/config.yml
```

Add each lab as a string in the `labs` array. Example structure:

```yaml
labs:
  - /absolute/path/to/my-lab.mjs
  - /absolute/path/to/another-lab.mjs
```

This allows the CLI to discover and manage multiple labs from a central location.
