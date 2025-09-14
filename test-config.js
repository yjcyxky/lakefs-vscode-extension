const { LakectlService } = require('./out/lakectlService');
const vscode = require('vscode');

// Mock vscode.workspace.getConfiguration
const mockConfig = {
    'lakefs.lakectlPath': '/Users/jy006/bin/lakectl'
};

const mockWorkspace = {
    getConfiguration: (section) => ({
        get: (key, defaultValue) => {
            const fullKey = section ? `${section}.${key}` : key;
            return mockConfig[fullKey] || defaultValue;
        }
    })
};

// Mock vscode.window.createOutputChannel
const mockWindow = {
    createOutputChannel: () => ({
        appendLine: console.log,
        show: () => {},
        dispose: () => {}
    })
};

// Setup mocks
global.vscode = {
    workspace: mockWorkspace,
    window: mockWindow
};

async function testConfig() {
    console.log('Testing LakeFS configuration functionality...\n');

    const service = LakectlService.getInstance();

    console.log('1. Testing default configuration (should use PATH):');
    mockConfig['lakefs.lakectlPath'] = '';
    const defaultResult = await service.checkLakectlInstalled();
    console.log('Result:', defaultResult);

    console.log('\n2. Testing custom path configuration:');
    mockConfig['lakefs.lakectlPath'] = '/Users/jy006/bin/lakectl';
    const customResult = await service.checkLakectlInstalled();
    console.log('Result:', customResult);

    console.log('\n3. Testing invalid path:');
    mockConfig['lakefs.lakectlPath'] = '/nonexistent/path/lakectl';
    const invalidResult = await service.checkLakectlInstalled();
    console.log('Result:', invalidResult);

    console.log('\nConfiguration testing completed!');
}

testConfig().catch(console.error);