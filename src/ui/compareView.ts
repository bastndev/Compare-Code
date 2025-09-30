import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import {
  getWebviewIcons,
  replaceIconsInHtml,
} from './webview/view/webviewIcons';

let comparePanel: vscode.WebviewPanel | undefined;

// Creates or shows the compare view
export async function createCompareView(
  context: vscode.ExtensionContext
): Promise<void> {
  if (comparePanel) {
    comparePanel.reveal(vscode.ViewColumn.One);
    return;
  }

  // Get the custom icon URIs
  const iconUri = {
    light: vscode.Uri.file(
      path.join(context.extensionPath, 'assets', 'images', 'cc-black.svg')
    ),
    dark: vscode.Uri.file(
      path.join(context.extensionPath, 'assets', 'images', 'cc.svg')
    ),
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
        vscode.Uri.file(path.join(context.extensionPath, 'dist')),
        vscode.Uri.file(path.join(context.extensionPath, 'assets')),
      ],
    }
  );

  comparePanel.iconPath = iconUri;
  comparePanel.webview.html = getWebviewContent(context, comparePanel.webview);

  // Handle messages from webview
  comparePanel.webview.onDidReceiveMessage(async (message) => {
    const config = vscode.workspace.getConfiguration('workbench');
    const location = config.get('sideBar.location');
    
    switch (message.command) {
      case 'toggleLeftPanel':
        if (location === 'left') {
          await vscode.commands.executeCommand('workbench.action.toggleSidebarVisibility');
        } else {
          await vscode.commands.executeCommand('workbench.action.toggleAuxiliaryBar');
        }
        break;
      case 'toggleRightPanel':
        if (location === 'left') {
          await vscode.commands.executeCommand('workbench.action.toggleAuxiliaryBar');
        } else {
          await vscode.commands.executeCommand('workbench.action.toggleSidebarVisibility');
        }
        break;
      case 'downloadCode':
        await handleCodeDownload(message.content, message.panel, message.fileExtension);
        break;
    }
  });

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
function getWebviewContent(
  context: vscode.ExtensionContext,
  webview: vscode.Webview
): string {
  // Get the CSS file URI (compiled from SCSS)
  const cssPath = vscode.Uri.file(
    path.join(
      context.extensionPath,
      'src',
      'ui',
      'webview',
      'styles',
      'main.css'
    )
  );
  const cssUri = webview.asWebviewUri(cssPath);

  // Get the script file URI (compiled from TS)
  const scriptPath = vscode.Uri.file(
    path.join(context.extensionPath, 'dist', 'main.js')
  );
  const scriptUri = webview.asWebviewUri(scriptPath);

  // Get icons from webviewIcons service
  const icons = getWebviewIcons(context, webview);

  // Read the HTML template
  const htmlPath = path.join(
    context.extensionPath,
    'src',
    'ui',
    'webview',
    'view',
    'index.html'
  );
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Replace CSS and Script URIs
  html = html.replace('{{CSS_URI}}', cssUri.toString());
  html = html.replace('{{SCRIPT_URI}}', scriptUri.toString());

  // ICONS - webviewIcons
  html = replaceIconsInHtml(html, icons);

  // Dynamic ICONS - Play & Stop | MARK: ICONS
  webview.postMessage({ type: 'setIcons', icons: { play: icons.play, stop: icons.stop, switchOn: icons.switchOn, switchOff: icons.switchOff } });

  return html;
}

// ------------------- ----- DOWNLOAD FILE

/**
 * Handle code download from webview securely using VS Code API
 * @param content The code content to download
 * @param panel Which panel (left/right) 
 * @param fileExtension File extension (ignored - always saves as .txt)
 */
async function handleCodeDownload(content: string, panel: string, fileExtension: string): Promise<void> {
  try {
    // Create short date format: YYYY-MM-DD
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // Gets YYYY-MM-DD format
    const filename = `code-${panel}-${dateStr}.txt`;

    // Get user's Downloads folder
    const downloadsPath = path.join(os.homedir(), 'Downloads');
    const defaultUri = vscode.Uri.file(path.join(downloadsPath, filename));

    // Show save dialog with Downloads as default location
    const saveUri = await vscode.window.showSaveDialog({
      defaultUri: defaultUri,
      filters: {
        'Text Files': ['txt'],
        'All Files': ['*']
      }
    });

    if (saveUri) {
      // Write file using VS Code's secure file system API
      const buffer = Buffer.from(content, 'utf8');
      await vscode.workspace.fs.writeFile(saveUri, buffer);
      
      // Show success message only
      vscode.window.showInformationMessage(
        `Code from ${panel} panel saved to Downloads!`
      );
      
    }
  } catch (error) {
    console.error('Download failed:', error);
    vscode.window.showErrorMessage(`Failed to save code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
