# LakeFS VSCode Extension

A comprehensive VSCode extension that brings LakeFS functionality directly into your editor, providing Git-like operations for LakeFS repositories with an intuitive interface.

## 🌟 Features

### 📁 File Management
- **File Decoration**: Automatically gray out files matching ignore patterns (`.gitignore`, `.lakefsignore`)
- **Smart Ignore**: Support for multiple ignore file types with auto-refresh
- **Visual Feedback**: Clear visual indicators for ignored files with hover tooltips

### 🌿 Branch Operations
- **Branch Switching**: Interactive branch selection with dropdown menu
- **Branch Listing**: View all available branches with commit IDs
- **Smart Checkout**: Execute `lakectl local checkout` with branch selection
- **Safety Confirmations**: Confirm dialogs before switching branches

### 📊 Repository Status
- **Status Display**: View `lakectl local status` output in VSCode
- **Real-time Updates**: Monitor working directory changes
- **Output Logging**: Detailed command execution logs

### 💾 Commit Operations
- **Interactive Commits**: Step-by-step commit process with message input
- **Metadata Support**: Add key-value metadata to commits
- **Batch Metadata**: Support for multiple metadata entries
- **Command Generation**: Auto-generate `lakectl local commit` commands

### 🌐 Web UI Integration
- **One-click Access**: Open repository in LakeFS web interface
- **Auto Configuration**: Read settings from `~/.lakectl.yaml` and `.lakefs_ref.yaml`
- **URL Building**: Intelligent URL construction for repository access

### ⚙️ Advanced Configuration
- **Custom Paths**: Configure custom `lakectl` executable paths
- **Path Validation**: Automatic validation of configured paths
- **Fallback Logic**: Smart fallback to PATH if custom path fails

## 🚀 Quick Start

### Prerequisites

1. **Install lakectl**:
   ```bash
   # Follow installation guide at: https://docs.lakefs.io/quickstart/installing.html
   ```

2. **Configure LakeFS**:
   - Create `~/.lakectl.yaml` with your server configuration
   - Ensure your workspace has `.lakefs_ref.yaml` with repository reference

### Installation

1. **From VSIX** (if available):
   ```bash
   code --install-extension lakefs-vscode-extension.vsix
   ```

2. **Development Installation**:
   ```bash
   git clone <repository-url>
   cd lakefs-vscode-extension
   npm install
   npm run compile
   ```

## 📋 Usage

### LakeFS Panel

The extension adds a **LakeFS** panel to the VSCode Explorer with the following features:

#### When lakectl is available:
- 📊 **Repository Status** - View working directory status
- 🌿 **Checkout Branch** - Switch between branches
- 💾 **Commit Changes** - Create commits with metadata
- 🌐 **Open Web UI** - Access repository in browser

#### When lakectl is not found:
- ⚠️ **Setup Required** - Links to installation guides and configuration options

### Operations

#### 1. View Repository Status
- Click "Repository Status" or use 📊 button
- Executes: `lakectl local status --show-ignored`
- Results displayed in new document window

#### 2. Switch Branches
- Click "Checkout Branch" or use 🌿 button
- Lists all available branches with commit IDs
- Executes: `lakectl local checkout . --ref lakefs://repo/branch`
- Auto-refreshes file explorer after checkout

#### 3. Commit Changes
- Click "Commit Changes" or use 💾 button
- Interactive dialog for commit message
- Optional metadata entry (key=value pairs)
- Executes: `lakectl local commit . -m "message" --meta "key=value"`

#### 4. Open Web UI
- Click "Open Web UI" or use 🌐 button
- Reads configuration from `~/.lakectl.yaml` and `.lakefs_ref.yaml`
- Opens: `https://your-server/repositories/repo-name/objects`

### Command Palette

Access all features via Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

- `LakeFS: Show Status`
- `LakeFS: Checkout Branch`
- `LakeFS: Commit Changes`
- `LakeFS: Open Web UI`
- `LakeFS: Refresh`

## ⚙️ Configuration

### Settings

Configure the extension in VSCode settings:

```json
{
  "lakefs.ignoreFiles": [".gitignore", ".lakefsignore"],
  "lakefs.enabled": true,
  "lakefs.lakectlPath": "/custom/path/to/lakectl"
}
```

#### Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `lakefs.ignoreFiles` | Array | `[".gitignore", ".lakefsignore"]` | Ignore files to monitor |
| `lakefs.enabled` | Boolean | `true` | Enable/disable file decoration |
| `lakefs.lakectlPath` | String | `""` | Custom path to lakectl executable |

### Required Files

#### 1. LakeFS Configuration (`~/.lakectl.yaml`)
```yaml
server:
  endpoint_url: https://your-lakefs-server.com
credentials:
  access_key_id: YOUR_ACCESS_KEY
  secret_access_key: YOUR_SECRET_KEY
```

#### 2. Repository Reference (`.lakefs_ref.yaml`)
```yaml
src: lakefs://repository-name/branch-name/
```

## 🔧 Development

### Setup
```bash
git clone <repository-url>
cd lakefs-vscode-extension
npm install
npm run compile
```

### Testing
```bash
# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Test with mock lakectl
chmod +x test-lakectl.sh
export PATH="$(pwd):$PATH"
```

### Project Structure
```
lakefs-vscode-extension/
├── src/
│   ├── extension.ts                    # Main extension entry
│   ├── lakectlService.ts              # LakeFS command service
│   ├── lakeFSConfigService.ts         # Configuration parser
│   ├── lakefsPanelProvider.ts         # Panel UI provider
│   ├── branchCheckoutDialog.ts        # Branch selection dialog
│   ├── commitDialog.ts                # Commit input dialog
│   └── ignoreFileDecorationProvider.ts # File decoration
├── package.json                       # Extension manifest
├── tsconfig.json                      # TypeScript config
└── README.md                          # This file
```

## 🐛 Troubleshooting

### lakectl not found
1. Install lakectl: https://docs.lakefs.io/quickstart/installing.html
2. Add to PATH or configure custom path in settings
3. Use "⚙️ Configure custom path" in panel

### Web UI unavailable
1. Check `~/.lakectl.yaml` exists with `server.endpoint_url`
2. Verify `.lakefs_ref.yaml` has valid `src` field
3. Ensure repository name matches configuration

### Branch switching fails
1. Verify `.lakefs_ref.yaml` exists in workspace root
2. Check network connectivity to LakeFS server
3. Confirm read permissions for repository

### Configuration issues
1. Use "Show Output" to view detailed logs
2. Check LakeFS output channel for errors
3. Verify lakectl works in terminal

## 📝 Examples

### Sample Workflow
1. **Open workspace** with LakeFS repository
2. **View status** to see current changes
3. **Switch branch** for feature work
4. **Make changes** to files
5. **Commit changes** with metadata
6. **Open web UI** to review in browser

### Sample Commands Generated
```bash
# Status check
lakectl local status --show-ignored

# Branch listing
lakectl branch list lakefs://my-repo

# Branch checkout
lakectl local checkout . --ref lakefs://my-repo/feature-branch

# Commit with metadata
lakectl local commit . -m "Add new feature" --meta "author=john" --meta "ticket=ABC-123"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Related Links

- [LakeFS Documentation](https://docs.lakefs.io/)
- [LakeFS GitHub](https://github.com/treeverse/lakeFS)
- [VSCode Extension API](https://code.visualstudio.com/api)

---

**Made with ❤️ for the LakeFS community**