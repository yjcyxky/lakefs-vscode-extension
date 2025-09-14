# VS Code Extension Makefile

# Variables
EXTENSION_NAME = your-extension-name
VERSION = $(shell node -p "require('./package.json').version")
VSIX_FILE = $(EXTENSION_NAME)-$(VERSION).vsix

# Default target
.PHONY: all
all: build package

# Install dependencies
.PHONY: install
install:
	npm install

# Build the extension
.PHONY: build
build: install
	npm run compile

# Package into VSIX file
.PHONY: package
package: build
	vsce package

# Clean build artifacts
.PHONY: clean
clean:
	rm -rf out/
	rm -rf node_modules/
	rm -f *.vsix

# Install VSCE if not present
.PHONY: install-vsce
install-vsce:
	npm install -g vsce

# Full build and package (one command)
.PHONY: vsix
vsix: install-vsce build package
	@echo "VSIX package created: $(VSIX_FILE)"

# Help target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  all        - Build and package the extension"
	@echo "  install    - Install npm dependencies"
	@echo "  build      - Compile the extension"
	@echo "  package    - Create VSIX package"
	@echo "  vsix       - One-click build and package"
	@echo "  clean      - Clean build artifacts"
	@echo "  help       - Show this help message"
