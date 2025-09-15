import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('compare-code.compareFiles', async () => {
		const document = await vscode.workspace.openTextDocument({ content: '', language: 'plaintext' });
		await vscode.window.showTextDocument(document);
	});
	context.subscriptions.push(disposable);
}

export function deactivate() {}