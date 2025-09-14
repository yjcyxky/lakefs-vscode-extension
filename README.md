# LakeFS Extension

A VSCode extension for LakeFS to support git-like functionality by graying out files/directories that match ignore file patterns in the Explorer.

## Features

- **File Graying Effect**: Display files/directories matched by ignore rules as grayed out in the Explorer
- **Multiple Ignore File Support**: Support for `.gitignore`, `.lakefsignore`, and custom ignore files
- **Auto Refresh**: Automatically update file decoration status when ignore files are modified
- **Hover Tooltip**: Show "Ignored by ignore file" tooltip when hovering over ignored files
- **Configurable**: Support for custom ignore file names and enable/disable functionality

## Installation

1. Clone or download this project
2. Run `npm install` in the project root directory to install dependencies
3. Run `npm run compile` to compile TypeScript code
4. Use `vsce package` to package the extension (requires `@vscode/vsce` to be installed first)
5. Install the generated `.vsix` file in VSCode

## Usage

### Basic Usage

Once the extension is installed and enabled, it will automatically read the `.gitignore` and `.lakefsignore` files in the workspace root directory and display matching files/directories as grayed out in the Explorer.

### Configuration Options

Open VSCode settings and search for "lakefs" to see the following configuration options:

#### `lakefs.ignoreFiles` (Array)
Specify the list of ignore file names to monitor.

**Default**: `[".gitignore", ".lakefsignore"]`

**Example configuration**:
```json
{
  "lakefs.ignoreFiles": [".gitignore", ".lakefsignore", ".customignore", ".dockerignore"]
}
```

#### `lakefs.enabled` (Boolean)
Enable or disable file decoration functionality.

**Default**: `true`

### Available Commands

The following commands are available in the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **LakeFS: Refresh Ignore Files** - Manually refresh ignore file status
- **LakeFS: Toggle File Decoration** - Toggle the enable status of file decoration functionality

## Ignore File Syntax

The extension uses the [ignore](https://www.npmjs.com/package/ignore) npm package to parse ignore files, supporting standard gitignore syntax:

```gitignore
# Ignore specific files
secret.txt

# Ignore specific directories
node_modules/
dist/

# Use wildcards
*.log
*.tmp

# Exclusion rules (use ! prefix)
!important.log
```

## Project Structure

```
lakefs-vscode-extension/
   src/
      extension.ts                    # Main entry file
      ignoreFileDecorationProvider.ts # File decoration provider
    package.json                        # Extension configuration and dependencies
    tsconfig.json                       # TypeScript configuration
    README.md                           # Documentation
```

## Development

### Local Development

1. Clone the project: `git clone <repository-url>`
2. Install dependencies: `npm install`
3. Open the project in VSCode
4. Press `F5` to start debugging, which will open a new VSCode window to test the extension

### Compilation and Packaging

```bash
# Compile TypeScript
npm run compile

# Watch for file changes and auto-compile
npm run watch

# Package the extension (requires @vscode/vsce to be installed)
npm install -g @vscode/vsce
vsce package
```

## Notes

- The extension monitors ignore file changes in the workspace root directory
- Supports multi-workspace environments
- File decoration uses the `gitDecoration.ignoredResourceForeground` color from VSCode themes
- The extension automatically loads and parses all configured ignore files on startup

## License

MIT License