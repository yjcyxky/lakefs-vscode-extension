import * as vscode from 'vscode';
import { IgnoreFileDecorationProvider } from './ignoreFileDecorationProvider';
import { LakeFSPanelProvider } from './lakefsPanelProvider';
import { LakectlService } from './lakectlService';
import { CommitDialog } from './commitDialog';
import { LakeFSConfigService } from './lakeFSConfigService';

let decorationProvider: IgnoreFileDecorationProvider | undefined;
let lakefsPanelProvider: LakeFSPanelProvider | undefined;
let lakectlService: LakectlService | undefined;
let configService: LakeFSConfigService | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('LakeFS Extension is being activated');

    // Initialize services
    decorationProvider = new IgnoreFileDecorationProvider();
    lakefsPanelProvider = new LakeFSPanelProvider();
    lakectlService = LakectlService.getInstance();
    configService = LakeFSConfigService.getInstance();

    console.log('LakeFS services initialized');

    // Register file decoration provider
    const decorationDisposable = vscode.window.registerFileDecorationProvider(decorationProvider);
    context.subscriptions.push(decorationDisposable);

    // Register tree data provider for LakeFS panel
    console.log('Registering LakeFS panel tree view');
    const treeView = vscode.window.createTreeView('lakefs-panel', {
        treeDataProvider: lakefsPanelProvider,
        showCollapseAll: false
    });
    context.subscriptions.push(treeView);
    console.log('LakeFS panel registered successfully');

    // Register commands
    const refreshIgnoreCommand = vscode.commands.registerCommand('lakefs.refreshIgnoreFiles', () => {
        decorationProvider?.refresh();
    });
    context.subscriptions.push(refreshIgnoreCommand);

    const toggleCommand = vscode.commands.registerCommand('lakefs.toggleDecoration', () => {
        decorationProvider?.toggleEnabled();
    });
    context.subscriptions.push(toggleCommand);

    const refreshPanelCommand = vscode.commands.registerCommand('lakefs.refresh', () => {
        lakefsPanelProvider?.refresh();
    });
    context.subscriptions.push(refreshPanelCommand);

    const showStatusCommand = vscode.commands.registerCommand('lakefs.showStatus', async () => {
        console.log('showStatus command executed');

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Getting LakeFS status...",
                cancellable: false
            }, async () => {
                console.log('Getting status from lakectl service');
                const status = await lakectlService!.getStatus();
                console.log('Status received:', status.substring(0, 100) + '...');

                // Show status in a new text document
                const document = await vscode.workspace.openTextDocument({
                    content: status,
                    language: 'plaintext'
                });

                await vscode.window.showTextDocument(document, {
                    viewColumn: vscode.ViewColumn.Beside,
                    preview: false
                });

                lakectlService!.showOutput();
            });
        } catch (error) {
            console.log('Error in showStatus command:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to get status: ${errorMessage}`);
            lakectlService!.showOutput();
        }
    });
    context.subscriptions.push(showStatusCommand);

    const commitCommand = vscode.commands.registerCommand('lakefs.commit', async () => {
        try {
            const commitData = await CommitDialog.show();

            if (!commitData) {
                return; // User cancelled
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Committing to LakeFS...",
                cancellable: false
            }, async () => {
                const result = await lakectlService!.commit(commitData.message, commitData.metadata);

                vscode.window.showInformationMessage(
                    `Successfully committed to LakeFS`,
                    'Show Output'
                ).then(selection => {
                    if (selection === 'Show Output') {
                        lakectlService!.showOutput();
                    }
                });

                // Refresh the panel
                lakefsPanelProvider?.refresh();
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Commit failed: ${errorMessage}`);
            lakectlService!.showOutput();
        }
    });
    context.subscriptions.push(commitCommand);

    const openWebUICommand = vscode.commands.registerCommand('lakefs.openWebUI', async () => {
        console.log('openWebUI command executed');

        try {
            const repositoryUrl = await configService!.buildRepositoryUrl();

            if (!repositoryUrl) {
                vscode.window.showErrorMessage(
                    'Cannot open Web UI: Missing lakectl configuration or .lakefs_ref.yaml file.\n\n' +
                    'Please ensure:\n' +
                    '1. ~/.lakectl.yaml exists with server endpoint\n' +
                    '2. .lakefs_ref.yaml exists in workspace root with src field'
                );
                return;
            }

            // Open URL in default browser
            const uri = vscode.Uri.parse(repositoryUrl);
            await vscode.env.openExternal(uri);

            // Show confirmation message
            const repoInfo = await configService!.getRepositoryInfo();
            if (repoInfo) {
                vscode.window.showInformationMessage(
                    `Opened ${repoInfo.repoName} repository in web browser`,
                    { modal: false }
                );
            }
        } catch (error) {
            console.log('Error in openWebUI command:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to open Web UI: ${errorMessage}`);
        }
    });
    context.subscriptions.push(openWebUICommand);

    // Push all providers to subscriptions
    context.subscriptions.push(decorationProvider);
}

export function deactivate() {
    if (decorationProvider) {
        decorationProvider.dispose();
        decorationProvider = undefined;
    }

    if (lakectlService) {
        lakectlService.dispose();
        lakectlService = undefined;
    }

    lakefsPanelProvider = undefined;
}