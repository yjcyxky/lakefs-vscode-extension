import * as vscode from 'vscode';
import { LakectlService } from './lakectlService';
import { LakeFSConfigService } from './lakeFSConfigService';

export class LakeFSPanelProvider implements vscode.TreeDataProvider<LakeFSItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<LakeFSItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    private lakectlService: LakectlService;
    private configService: LakeFSConfigService;

    constructor() {
        console.log('LakeFSPanelProvider constructor called');
        this.lakectlService = LakectlService.getInstance();
        this.configService = LakeFSConfigService.getInstance();

        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('lakefs.lakectlPath')) {
                console.log('lakectl path configuration changed, refreshing panel');
                this.refresh();
            }
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: LakeFSItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: LakeFSItem): Promise<LakeFSItem[]> {
        console.log('getChildren called with element:', element);

        if (!element) {
            // Check if lakectl is installed
            const lakectlStatus = await this.lakectlService.checkLakectlInstalled();

            const items: LakeFSItem[] = [];

            if (!lakectlStatus.installed) {
                const config = vscode.workspace.getConfiguration('lakefs');
                const customPath = config.get<string>('lakectlPath', '').trim();

                let label = '⚠️ lakectl not found';
                let tooltip = 'lakectl is required but not found. Click for help.';

                if (customPath) {
                    label = '⚠️ lakectl path invalid';
                    tooltip = `Custom path configured but invalid: ${customPath}\nError: ${lakectlStatus.error || 'Unknown error'}\nClick to open settings.`;
                } else {
                    tooltip = 'lakectl not found in PATH. Click to view installation instructions or configure custom path.';
                }

                items.push(new LakeFSItem(
                    label,
                    tooltip,
                    vscode.TreeItemCollapsibleState.None,
                    customPath ? {
                        command: 'workbench.action.openSettings',
                        title: 'Open Settings',
                        arguments: ['lakefs.lakectlPath']
                    } : {
                        command: 'vscode.open',
                        title: 'Install lakectl',
                        arguments: [vscode.Uri.parse('https://docs.lakefs.io/quickstart/installing.html')]
                    }
                ));

                // Add a settings item if using default path
                if (!customPath) {
                    items.push(new LakeFSItem(
                        '⚙️ Configure custom path',
                        'Set a custom path to lakectl executable',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'workbench.action.openSettings',
                            title: 'Open Settings',
                            arguments: ['lakefs.lakectlPath']
                        }
                    ));
                }
            } else {
                // Check if we can get repository info for web UI
                const repoInfo = await this.configService.getRepositoryInfo();

                items.push(
                    new LakeFSItem(
                        'Repository Status',
                        'Click to view lakectl local status',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'lakefs.showStatus',
                            title: 'Show Status',
                            arguments: []
                        }
                    ),
                    new LakeFSItem(
                        'Commit Changes',
                        'Click to commit changes to LakeFS',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'lakefs.commit',
                            title: 'Commit Changes',
                            arguments: []
                        }
                    )
                );

                // Add Web UI button if repo info is available
                if (repoInfo) {
                    items.push(new LakeFSItem(
                        'Open Web UI',
                        `Open ${repoInfo.repoName} repository in web browser`,
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'lakefs.openWebUI',
                            title: 'Open Web UI',
                            arguments: []
                        }
                    ));
                } else {
                    items.push(new LakeFSItem(
                        '⚠️ Web UI unavailable',
                        'Cannot find lakectl config or .lakefs_ref.yaml file',
                        vscode.TreeItemCollapsibleState.None,
                        undefined
                    ));
                }
            }

            console.log('Returning root items:', items.length);
            return items;
        }

        return [];
    }
}

export class LakeFSItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.command = command;

        // Set appropriate icons
        if (label === 'Repository Status') {
            this.iconPath = new vscode.ThemeIcon('git-compare');
        } else if (label === 'Commit Changes') {
            this.iconPath = new vscode.ThemeIcon('git-commit');
        } else if (label === 'Open Web UI') {
            this.iconPath = new vscode.ThemeIcon('globe');
        } else if (label.includes('not found') || label.includes('invalid') || label.includes('unavailable')) {
            this.iconPath = new vscode.ThemeIcon('warning');
        } else if (label.includes('Configure custom path')) {
            this.iconPath = new vscode.ThemeIcon('gear');
        }
    }
}