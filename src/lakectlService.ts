import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class LakectlService {
    private static instance: LakectlService;
    private outputChannel: vscode.OutputChannel;

    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel('LakeFS');
    }

    static getInstance(): LakectlService {
        if (!LakectlService.instance) {
            LakectlService.instance = new LakectlService();
        }
        return LakectlService.instance;
    }

    private getLakectlCommand(): string {
        const config = vscode.workspace.getConfiguration('lakefs');
        const customPath = config.get<string>('lakectlPath', '').trim();

        if (customPath) {
            return customPath;
        }

        return 'lakectl';
    }

    private async validateLakectlPath(lakectlPath: string): Promise<{ valid: boolean; error?: string }> {
        if (!lakectlPath || lakectlPath === 'lakectl') {
            // For default 'lakectl', we'll let the system PATH handle it
            return { valid: true };
        }

        // Check if custom path exists
        try {
            const stats = fs.statSync(lakectlPath);
            if (!stats.isFile()) {
                return { valid: false, error: `Path exists but is not a file: ${lakectlPath}` };
            }

            // Check if file is executable (on Unix-like systems)
            if (process.platform !== 'win32') {
                try {
                    fs.accessSync(lakectlPath, fs.constants.F_OK | fs.constants.X_OK);
                } catch (accessError) {
                    return { valid: false, error: `File is not executable: ${lakectlPath}` };
                }
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: `File not found: ${lakectlPath}` };
        }
    }

    async checkLakectlInstalled(): Promise<{ installed: boolean; error?: string }> {
        try {
            const lakectlCmd = this.getLakectlCommand();

            // First validate the path if it's custom
            const validation = await this.validateLakectlPath(lakectlCmd);
            if (!validation.valid) {
                return { installed: false, error: validation.error };
            }

            await this.executeCommand(lakectlCmd, ['--version']);
            return { installed: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { installed: false, error: errorMessage };
        }
    }

    async executeCommand(command: string, args: string[], cwd?: string): Promise<{ stdout: string; stderr: string }> {
        return new Promise((resolve, reject) => {
            const fullCommand = `${command} ${args.join(' ')}`;
            this.outputChannel.appendLine(`Executing: ${fullCommand}`);

            const options: cp.ExecOptions = {
                cwd: cwd || this.getWorkspaceRoot(),
                encoding: 'utf8'
            };

            cp.exec(fullCommand, options, (error, stdout, stderr) => {
                if (error) {
                    this.outputChannel.appendLine(`Error: ${error.message}`);

                    // Check if it's a command not found error
                    if (error.message.includes('command not found') ||
                        error.message.includes('not recognized') ||
                        (error as any).code === 'ENOENT') {
                        const config = vscode.workspace.getConfiguration('lakefs');
                        const customPath = config.get<string>('lakectlPath', '').trim();

                        let errorMsg = 'lakectl command not found.\n\n';

                        if (customPath) {
                            errorMsg += `Custom lakectl path configured: ${customPath}\n`;
                            errorMsg += 'Please verify the path is correct, or update it in settings.\n\n';
                        } else {
                            errorMsg += 'lakectl is not installed or not found in PATH.\n\n';
                            errorMsg += 'You can either:\n';
                            errorMsg += '1. Install lakectl and add it to PATH: https://docs.lakefs.io/quickstart/installing.html\n';
                            errorMsg += '2. Set a custom path in settings: lakefs.lakectlPath\n\n';
                        }

                        errorMsg += `Original error: ${error.message}`;

                        reject(new Error(errorMsg));
                        return;
                    }

                    reject(error);
                    return;
                }

                this.outputChannel.appendLine(`Output: ${stdout}`);
                if (stderr) {
                    this.outputChannel.appendLine(`Stderr: ${stderr}`);
                }

                resolve({
                    stdout: stdout.toString(),
                    stderr: stderr.toString()
                });
            });
        });
    }

    async getStatus(): Promise<string> {
        try {
            const lakectlCmd = this.getLakectlCommand();
            const result = await this.executeCommand(lakectlCmd, ['local', 'status', '--show-ignored']);
            return result.stdout;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get status: ${errorMessage}`);
        }
    }

    async commit(message: string, metadata: { [key: string]: string } = {}): Promise<string> {
        try {
            const lakectlCmd = this.getLakectlCommand();
            const args = ['local', 'commit', '.', '-m', `"${message}"`];

            // Add metadata arguments
            for (const [key, value] of Object.entries(metadata)) {
                args.push('--meta', `"${key}=${value}"`);
            }

            const result = await this.executeCommand(lakectlCmd, args);
            return result.stdout;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to commit: ${errorMessage}`);
        }
    }

    private getWorkspaceRoot(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error('No workspace folder found');
        }
        return workspaceFolders[0].uri.fsPath;
    }

    showOutput(): void {
        this.outputChannel.show();
    }

    dispose(): void {
        this.outputChannel.dispose();
    }
}