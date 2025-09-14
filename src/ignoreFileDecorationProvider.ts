import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import ignore from 'ignore';

export class IgnoreFileDecorationProvider implements vscode.FileDecorationProvider, vscode.Disposable {
    private readonly _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

    private ignoreInstance = ignore();
    private watchers: vscode.FileSystemWatcher[] = [];
    private isEnabled = true;

    constructor() {
        this.initialize();
        this.watchConfigurationChanges();
    }

    private initialize(): void {
        this.loadIgnoreFiles();
        this.setupFileWatchers();
    }

    private watchConfigurationChanges(): void {
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('lakefs.ignoreFiles') || e.affectsConfiguration('lakefs.enabled')) {
                this.refresh();
            }
        });
    }

    private getIgnoreFiles(): string[] {
        const config = vscode.workspace.getConfiguration('lakefs');
        return config.get<string[]>('ignoreFiles', ['.gitignore']);
    }

    private getIsEnabled(): boolean {
        const config = vscode.workspace.getConfiguration('lakefs');
        return config.get<boolean>('enabled', true);
    }

    private loadIgnoreFiles(): void {
        this.ignoreInstance = ignore();
        this.isEnabled = this.getIsEnabled();

        if (!this.isEnabled) {
            return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        const ignoreFiles = this.getIgnoreFiles();

        for (const folder of workspaceFolders) {
            for (const ignoreFileName of ignoreFiles) {
                const ignoreFilePath = path.join(folder.uri.fsPath, ignoreFileName);

                try {
                    if (fs.existsSync(ignoreFilePath)) {
                        const ignoreContent = fs.readFileSync(ignoreFilePath, 'utf8');
                        this.ignoreInstance.add(ignoreContent);
                    }
                } catch (error) {
                    console.error(`Failed to read ignore file ${ignoreFilePath}:`, error);
                }
            }
        }
    }

    private setupFileWatchers(): void {
        this.disposeWatchers();

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        const ignoreFiles = this.getIgnoreFiles();

        for (const folder of workspaceFolders) {
            for (const ignoreFileName of ignoreFiles) {
                const pattern = new vscode.RelativePattern(folder, ignoreFileName);
                const watcher = vscode.workspace.createFileSystemWatcher(pattern);

                watcher.onDidChange(() => this.refresh());
                watcher.onDidCreate(() => this.refresh());
                watcher.onDidDelete(() => this.refresh());

                this.watchers.push(watcher);
            }
        }
    }

    private disposeWatchers(): void {
        this.watchers.forEach(watcher => watcher.dispose());
        this.watchers = [];
    }

    provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
        if (!this.isEnabled) {
            return undefined;
        }

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (!workspaceFolder) {
            return undefined;
        }

        const relativePath = path.relative(workspaceFolder.uri.fsPath, uri.fsPath);

        if (this.ignoreInstance.ignores(relativePath)) {
            return {
                color: new vscode.ThemeColor('gitDecoration.ignoredResourceForeground'),
                tooltip: 'Ignored by ignore file'
            };
        }

        return undefined;
    }

    refresh(): void {
        this.loadIgnoreFiles();
        this.setupFileWatchers();
        this._onDidChangeFileDecorations.fire(undefined);
    }

    toggleEnabled(): void {
        const config = vscode.workspace.getConfiguration('lakefs');
        const currentValue = config.get<boolean>('enabled', true);
        config.update('enabled', !currentValue, vscode.ConfigurationTarget.Workspace);
    }

    dispose(): void {
        this.disposeWatchers();
        this._onDidChangeFileDecorations.dispose();
    }
}