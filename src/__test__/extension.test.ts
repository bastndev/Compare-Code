import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../extension';

suite('Compare Code Extension Tests', () => {
	vscode.window.showInformationMessage('Starting Compare Code tests...');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('bastndev.compare-code'));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('bastndev.compare-code');
		if (extension) {
			await extension.activate();
			assert.strictEqual(extension.isActive, true);
		}
	});

	test('Compare command should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('compare-code.compareFiles'));
	});

	test('Extension exports should be available', () => {
		assert.ok(typeof myExtension.activate === 'function');
		assert.ok(typeof myExtension.deactivate === 'function');
	});
});
