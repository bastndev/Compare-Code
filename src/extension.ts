import * as vscode from 'vscode';
import { createCompareView, closeCompareView, isViewOpen } from './ui/compareView';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('compare-code.compareFiles', async () => {
		try {
			if (isViewOpen()) {
				// If it's open, close it
				await closeCompareView();
			} else {
				// If it's not open, create/show it
				await createCompareView(context);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Error handling the comparison view: ${error}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	closeCompareView(); // Clean up on deactivation
}