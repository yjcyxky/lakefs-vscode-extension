import * as vscode from 'vscode';

export interface CommitData {
    message: string;
    metadata: { [key: string]: string };
}

export class CommitDialog {
    static async show(): Promise<CommitData | undefined> {
        // First, ask for commit message
        const message = await vscode.window.showInputBox({
            prompt: 'Enter commit message',
            placeHolder: 'Commit message...',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Commit message cannot be empty';
                }
                return null;
            }
        });

        if (!message) {
            return undefined;
        }

        // Then ask for metadata
        const metadata: { [key: string]: string } = {};

        while (true) {
            const addMetadata = await vscode.window.showQuickPick(
                ['Add metadata', 'Finish and commit'],
                {
                    placeHolder: 'Do you want to add metadata?'
                }
            );

            if (!addMetadata || addMetadata === 'Finish and commit') {
                break;
            }

            // Get metadata key
            const key = await vscode.window.showInputBox({
                prompt: 'Enter metadata key',
                placeHolder: 'e.g., author, version, environment...',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Key cannot be empty';
                    }
                    if (value.includes('=') || value.includes(' ')) {
                        return 'Key cannot contain spaces or equals signs';
                    }
                    return null;
                }
            });

            if (!key) {
                continue;
            }

            // Get metadata value
            const value = await vscode.window.showInputBox({
                prompt: `Enter value for "${key}"`,
                placeHolder: 'Metadata value...',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Value cannot be empty';
                    }
                    return null;
                }
            });

            if (!value) {
                continue;
            }

            metadata[key.trim()] = value.trim();

            // Show current metadata
            const metadataList = Object.entries(metadata)
                .map(([k, v]) => `${k}=${v}`)
                .join(', ');

            vscode.window.showInformationMessage(
                `Current metadata: ${metadataList}`,
                { modal: false }
            );
        }

        return {
            message: message.trim(),
            metadata
        };
    }
}
