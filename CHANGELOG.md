# Changelog

All notable changes to the LakeFS VSCode Extension will be documented in this file.

## [0.0.1] - 2025-01-14

### 🎉 Initial Release

#### ✨ Features Added

**Core LakeFS Integration**
- Full lakectl command integration with custom path support
- Automatic lakectl installation detection and configuration guidance
- Comprehensive error handling with user-friendly messages

**Branch Management**
- 🌿 Interactive branch switching with dropdown selection
- Branch listing with commit ID display
- Safe checkout with confirmation dialogs
- Automatic workspace refresh after branch changes

**Repository Operations**
- 📊 Repository status viewing with `lakectl local status`
- 💾 Interactive commit process with metadata support
- Multiple metadata key-value pairs support
- Command generation and execution logging

**Web UI Integration**
- 🌐 One-click access to LakeFS web interface
- Automatic URL construction from configuration files
- Support for custom LakeFS server endpoints

**File Management**
- 📁 File decoration for ignored files (grayed out display)
- Support for multiple ignore file types (.gitignore, .lakefsignore)
- Auto-refresh on ignore file changes
- Hover tooltips for ignored files

**User Interface**
- Dedicated LakeFS panel in Explorer sidebar
- Toolbar buttons for quick access to common operations
- Command palette integration for all features
- Progress indicators for long-running operations

**Configuration**
- ⚙️ Custom lakectl path configuration
- Configurable ignore file monitoring
- Enable/disable toggle for file decoration
- Machine-level configuration support

#### 🔧 Technical Implementation

**Services**
- `LakectlService`: Command execution and output parsing
- `LakeFSConfigService`: Configuration file parsing (YAML)
- `LakeFSPanelProvider`: UI tree data provider
- `BranchCheckoutDialog`: Interactive branch selection
- `CommitDialog`: Commit message and metadata input

**Configuration Files Support**
- `~/.lakectl.yaml`: LakeFS server configuration
- `.lakefs_ref.yaml`: Repository reference and branch info
- VSCode settings integration

**Command Support**
- `lakectl local status --show-ignored`
- `lakectl branch list lakefs://repo`
- `lakectl local checkout . --ref lakefs://repo/branch`
- `lakectl local commit . -m "message" --meta "key=value"`

#### 📋 Available Commands

- `LakeFS: Show Status` - View repository status
- `LakeFS: Checkout Branch` - Switch branches interactively
- `LakeFS: Commit Changes` - Create commits with metadata
- `LakeFS: Open Web UI` - Access web interface
- `LakeFS: Refresh` - Refresh panel and status

#### 🛠️ Configuration Options

```json
{
  "lakefs.ignoreFiles": [".gitignore", ".lakefsignore"],
  "lakefs.enabled": true,
  "lakefs.lakectlPath": ""
}
```

#### 📚 Documentation

- Comprehensive README with usage examples
- Detailed USAGE.md guide
- Troubleshooting section
- Development setup instructions

#### 🧪 Testing

- Mock lakectl script for development testing
- Branch parsing validation
- URL construction verification
- Command execution testing

### 🎯 Supported Workflows

1. **Status Monitoring**: Check working directory changes
2. **Branch Switching**: Navigate between repository branches
3. **Commit Creation**: Save changes with descriptive metadata
4. **Web Access**: Quick jump to repository web interface
5. **File Management**: Visual indication of ignored files

### 📦 Dependencies

- `js-yaml`: YAML configuration file parsing
- `ignore`: .gitignore pattern matching
- `@types/js-yaml`: TypeScript definitions
- VSCode API: Extension framework

---

**Note**: This is the initial release providing core LakeFS functionality in VSCode. Future releases will expand on these features based on user feedback and community needs.