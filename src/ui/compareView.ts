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
			retainContextWhenHidden: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(context.extensionPath, 'src')),
				vscode.Uri.file(path.join(context.extensionPath, 'styles')),
				vscode.Uri.file(path.join(context.extensionPath, 'dist'))
			]
		}
	);

	comparePanel.iconPath = iconUri;
	comparePanel.webview.html = getWebviewContent(context, comparePanel.webview);

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

// Generates HTML content for the webview MARK:HTML / SCSS / TS
function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview): string {
	// Get the CSS file URI (compiled from SCSS)
	const cssPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'webview', 'styles', 'global.css'));
	const cssUri = webview.asWebviewUri(cssPath);

	// Get the script file URI (compiled from TS)
	const scriptPath = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'compareService.js'));
	const scriptUri = webview.asWebviewUri(scriptPath);

	// Read the HTML template
	const htmlPath = path.join(context.extensionPath, 'src', 'ui', 'webview', 'index.html');
	let html = fs.readFileSync(htmlPath, 'utf8');
	
	// SCSS
	html = html.replace('{{CSS_URI}}', cssUri.toString());
	
	// TS
	html = html.replace('{{SCRIPT_URI}}', scriptUri.toString());
	
	return html;
}