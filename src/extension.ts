import * as vscode from 'vscode';
import { IgnoreFileDecorationProvider } from './ignoreFileDecorationProvider';

let decorationProvider: IgnoreFileDecorationProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
    decorationProvider = new IgnoreFileDecorationProvider();

    const disposable = vscode.window.registerFileDecorationProvider(decorationProvider);
    context.subscriptions.push(disposable);

    const refreshCommand = vscode.commands.registerCommand('lakefs.refreshIgnoreFiles', () => {
        decorationProvider?.refresh();
    });
    context.subscriptions.push(refreshCommand);

    const toggleCommand = vscode.commands.registerCommand('lakefs.toggleDecoration', () => {
        decorationProvider?.toggleEnabled();
    });
    context.subscriptions.push(toggleCommand);

    context.subscriptions.push(decorationProvider);
}

export function deactivate() {
    if (decorationProvider) {
        decorationProvider.dispose();
        decorationProvider = undefined;
    }
}