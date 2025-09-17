import * as vscode from 'vscode';
import * as path from 'path';

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

	comparePanel.webview.html = getWebviewContent();

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
function getWebviewContent(): string {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Compare Code</title>
		<style>
			body {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100vh;
				margin: 0;
			}
			
			.circle {
				width: 100px;
				height: 100px;
				background-color: red;
				border-radius: 50%;
			}
		</style>
	</head>
	<body>
		<div class="circle"></div>
	</body>
	</html>
	`;
}