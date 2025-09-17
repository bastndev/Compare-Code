import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let comparePanel: vscode.WebviewPanel | undefined;

// Creates or shows the compare view
export async function createCompareView(context: vscode.ExtensionContext): Promise<void> {
	if (comparePanel) {
		comparePanel.reveal(vscode.ViewColumn.One);
		return;
	}

	// Get the custom icon URIs
	const iconUri = {
		light: vscode.Uri.file(path.join(context.extensionPath, 'assets', 'images', 'cc-black.svg')),
		dark: vscode.Uri.file(path.join(context.extensionPath, 'assets', 'images', 'cc.svg'))
	};

	comparePanel = vscode.window.createWebviewPanel(
		'compareCode',
		'Compare Code',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);

	comparePanel.iconPath = iconUri;
	comparePanel.webview.html = getWebviewContent(context);

	comparePanel.onDidDispose(() => {
		comparePanel = undefined;
	});
}

// Closes the compare view if open
export async function closeCompareView(): Promise<void> {
	if (comparePanel) {
		comparePanel.dispose();
		comparePanel = undefined;
	}
}

// Checks if the view is currently open
export function isViewOpen(): boolean {
	return comparePanel !== undefined && comparePanel.visible;
}

// Generates HTML content for the webview
function getWebviewContent(context: vscode.ExtensionContext): string {
	const htmlPath = path.join(context.extensionPath, 'src', 'ui', 'webview', 'index.html');
	return fs.readFileSync(htmlPath, 'utf8');
}