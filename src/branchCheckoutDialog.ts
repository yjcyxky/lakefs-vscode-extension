import * as vscode from 'vscode';
import { LakectlService, Branch } from './lakectlService';
import { LakeFSConfigService } from './lakeFSConfigService';

export interface CheckoutData {
    branch: string;
    repositoryUri: string;
}

export class BranchCheckoutDialog {
    private static lakectlService = LakectlService.getInstance();
    private static configService = LakeFSConfigService.getInstance();

    static async show(): Promise<CheckoutData | undefined> {
        try {
            // Get repository info from .lakefs_ref.yaml
            const refConfig = await this.configService.getLakeFSRefConfig();
            if (!refConfig?.src) {
                vscode.window.showErrorMessage(
                    'Cannot checkout: No .lakefs_ref.yaml file found or missing src field'
                );
                return undefined;
            }

            // Parse repository URI from src (e.g., "lakefs://bdnf-mecfs/main/")
            const repoInfo = this.configService.parseRepoInfo(refConfig.src);
            if (!repoInfo) {
                vscode.window.showErrorMessage(
                    'Cannot checkout: Invalid src format in .lakefs_ref.yaml'
                );
                return undefined;
            }

            const repositoryUri = `lakefs://${repoInfo.name}`;

            // Show progress while loading branches
            return await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Loading branches...",
                cancellable: true
            }, async (progress, token) => {
                try {
                    // Get list of branches
                    const branches = await this.lakectlService.listBranches(repositoryUri);

                    if (token.isCancellationRequested) {
                        return undefined;
                    }

                    if (branches.length === 0) {
                        vscode.window.showWarningMessage(
                            `No branches found in repository: ${repoInfo.name}`
                        );
                        return undefined;
                    }

                    // Create quick pick items
                    const quickPickItems: vscode.QuickPickItem[] = branches.map(branch => ({
                        label: branch.name,
                        description: branch.commitId.substring(0, 8) + '...',
                        detail: `Commit: ${branch.commitId}`,
                        picked: branch.name === repoInfo.branch // Pre-select current branch
                    }));

                    // Show branch selection
                    const selectedItem = await vscode.window.showQuickPick(quickPickItems, {
                        placeHolder: `Select a branch to checkout (Current: ${repoInfo.branch})`,
                        matchOnDescription: true,
                        matchOnDetail: true,
                        canPickMany: false
                    });

                    if (!selectedItem) {
                        return undefined; // User cancelled
                    }

                    // Confirm checkout if switching to a different branch
                    if (selectedItem.label !== repoInfo.branch) {
                        const confirmation = await vscode.window.showWarningMessage(
                            `Switch from "${repoInfo.branch}" to "${selectedItem.label}"?\n\nThis will update your working directory to match the selected branch.`,
                            { modal: true },
                            'Checkout',
                            'Cancel'
                        );

                        if (confirmation !== 'Checkout') {
                            return undefined;
                        }
                    } else {
                        // User selected the same branch
                        const confirmation = await vscode.window.showInformationMessage(
                            `Refresh working directory with "${selectedItem.label}" branch?`,
                            'Refresh',
                            'Cancel'
                        );

                        if (confirmation !== 'Refresh') {
                            return undefined;
                        }
                    }

                    return {
                        branch: selectedItem.label,
                        repositoryUri: repositoryUri
                    };

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    vscode.window.showErrorMessage(`Failed to load branches: ${errorMessage}`);
                    return undefined;
                }
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Checkout failed: ${errorMessage}`);
            return undefined;
        }
    }

    static async showAdvanced(): Promise<CheckoutData | undefined> {
        // For future enhancement: allow manual repository and branch input
        return this.show();
    }
}