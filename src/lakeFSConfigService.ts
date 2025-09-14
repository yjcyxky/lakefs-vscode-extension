import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';

export interface LakeFSConfig {
    server?: {
        endpoint_url?: string;
    };
}

export interface LakeFSRefConfig {
    src?: string;
}

export interface RepoInfo {
    name: string;
    branch: string;
}

export class LakeFSConfigService {
    private static instance: LakeFSConfigService;

    private constructor() {}

    static getInstance(): LakeFSConfigService {
        if (!LakeFSConfigService.instance) {
            LakeFSConfigService.instance = new LakeFSConfigService();
        }
        return LakeFSConfigService.instance;
    }

    /**
     * Parse ~/.lakectl.yaml to get server endpoint
     */
    async getLakectlConfig(): Promise<LakeFSConfig | null> {
        try {
            // Try multiple possible locations for lakectl config
            const possiblePaths = [
                path.join(os.homedir(), '.lakectl.yaml'),
                path.join(os.homedir(), '.lakectl.yml'),
                // For testing purposes, also check current directory
                path.join(process.cwd(), '.lakectl.yaml')
            ];

            let configPath: string | null = null;
            for (const tryPath of possiblePaths) {
                if (fs.existsSync(tryPath)) {
                    configPath = tryPath;
                    break;
                }
            }

            if (!configPath) {
                console.log('lakectl config file not found in any of these locations:', possiblePaths);
                return null;
            }

            const configContent = fs.readFileSync(configPath, 'utf8');
            const config = yaml.load(configContent) as LakeFSConfig;

            console.log('Loaded lakectl config from:', configPath);
            console.log('Config:', config);
            return config;
        } catch (error) {
            console.error('Failed to parse lakectl config:', error);
            return null;
        }
    }

    /**
     * Parse .lakefs_ref.yaml from current workspace to get repository info
     */
    async getLakeFSRefConfig(): Promise<LakeFSRefConfig | null> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                console.log('No workspace folder found');
                return null;
            }

            const refPath = path.join(workspaceFolders[0].uri.fsPath, '.lakefs_ref.yaml');

            if (!fs.existsSync(refPath)) {
                console.log('lakefs ref file not found at:', refPath);
                return null;
            }

            const refContent = fs.readFileSync(refPath, 'utf8');
            const refConfig = yaml.load(refContent) as LakeFSRefConfig;

            console.log('Loaded lakefs ref config:', refConfig);
            return refConfig;
        } catch (error) {
            console.error('Failed to parse lakefs ref config:', error);
            return null;
        }
    }

    /**
     * Parse repository name and branch from src field
     * Format: lakefs://repo-name/branch/path
     */
    parseRepoInfo(src: string): RepoInfo | null {
        try {
            const match = src.match(/^lakefs:\/\/([^\/]+)\/([^\/]+)/);
            if (!match) {
                console.log('Invalid src format:', src);
                return null;
            }

            return {
                name: match[1],
                branch: match[2]
            };
        } catch (error) {
            console.error('Failed to parse repo info:', error);
            return null;
        }
    }

    /**
     * Build the repository objects URL
     */
    async buildRepositoryUrl(): Promise<string | null> {
        try {
            // Get lakectl config
            const config = await this.getLakectlConfig();
            if (!config?.server?.endpoint_url) {
                throw new Error('No endpoint URL found in lakectl config');
            }

            // Get lakefs ref config
            const refConfig = await this.getLakeFSRefConfig();
            if (!refConfig?.src) {
                throw new Error('No src field found in .lakefs_ref.yaml');
            }

            // Parse repo info
            const repoInfo = this.parseRepoInfo(refConfig.src);
            if (!repoInfo) {
                throw new Error('Failed to parse repository info from src field');
            }

            // Build URL
            const baseUrl = config.server.endpoint_url.replace(/\/$/, ''); // Remove trailing slash
            const url = `${baseUrl}/repositories/${repoInfo.name}/objects`;

            console.log('Built repository URL:', url);
            return url;
        } catch (error) {
            console.error('Failed to build repository URL:', error);
            return null;
        }
    }

    /**
     * Get repository info for display
     */
    async getRepositoryInfo(): Promise<{ repoName: string; branch: string; endpoint: string } | null> {
        try {
            const config = await this.getLakectlConfig();
            const refConfig = await this.getLakeFSRefConfig();

            if (!config?.server?.endpoint_url || !refConfig?.src) {
                return null;
            }

            const repoInfo = this.parseRepoInfo(refConfig.src);
            if (!repoInfo) {
                return null;
            }

            return {
                repoName: repoInfo.name,
                branch: repoInfo.branch,
                endpoint: config.server.endpoint_url
            };
        } catch (error) {
            console.error('Failed to get repository info:', error);
            return null;
        }
    }
}