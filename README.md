# @sidekick-coder/lab

A developer-friendly CLI for managing and running commands globally

- No need for `node_modules` but still keeps type safety
- Modular commands with lab.mjs files 
- Default modules for common tasks

## Installation

You can install globally using npm:

```sh
npm install -g @sidekick-coder/lab
```

Or use it directly with npx (no install required):

```sh
npx @sidekick-coder/lab [command]
```

## Usage

After installing globally, run the CLI with:

```sh
lab [command]
```

Or, if using npx:

```sh
npx @sidekick-coder/lab [command]
```

## Setting up an Alias

To make it easier to use, you can set up a shell alias. Add the following to your shell profile (e.g., `.bashrc`, `.zshrc`, or PowerShell `$PROFILE`):

### Bash/Zsh
```sh
alias lab="npx @sidekick-coder/lab"
```

### PowerShell
```powershell
Set-Alias lab "npx @sidekick-coder/lab"
```

Now you can use `lab` as a shortcut for the CLI.

## Labs

Labs are modular JavaScript files that extend the CLI with custom subcommands. You can initialize a new lab in your project with:

```sh
lab init [name]
```

This generates a `tsconfig.json`, a `lab.mjs` entry point, and a sample command.

A typical `lab.mjs` registers your lab and its subcommands:

```js
import { createCommander } from '@lab/core/commander/index.js'
import { defineLab } from '@lab/utils/index.js'
import { resolve } from 'path'

export default defineLab({
    name: 'my-lab',
    setup(lab) {
        const commander = createCommander({
            bin: `${lab.commander.bin} my-lab`,
        })
        commander.addFolder(resolve(import.meta.dirname, './commands'))
        lab.commander.addSubCommander('my-lab', commander)
    },
})
```

You can register labs globally by adding their paths to your home config file (e.g., `~/.lab/config.yml`):

```yaml
labs:
  - /absolute/path/to/my-lab.mjs
  - /absolute/path/to/another-lab.mjs
```

For more details, see the full [Lab Registration Guide](docs/lab.md).

## License

MIT
