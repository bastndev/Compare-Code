import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import {
  getWebviewIcons,
  replaceIconsInHtml,
} from './webview/view/webviewIcons';

/**
 * Convert TypeScript to JavaScript for webview (basic conversion)
 * @param tsContent TypeScript content
 * @returns JavaScript content
 */
function convertTStoJS(tsContent: string): string {
  return tsContent
    // Remove TypeScript imports/exports
    .replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '')
    .replace(/export\s+\{[^}]*\};\s*/g, '')
    .replace(/export\s+type\s+.*?;\s*/g, '')
    .replace(/export\s+/g, '')
    
    // Remove TypeScript type annotations
    .replace(/:\s*[A-Za-z][A-Za-z0-9<>[\]|&\s]*(?=\s*[=,;)])/g, '')
    .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
    
    // Remove generic type parameters
    .replace(/<[^>]*>/g, '')
    
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

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
      case 'changeLanguage':
        // Handle language change if needed (currently handled in webview)
        console.log(`Language changed to: ${message.language}`);
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

  // Read the i18n TypeScript file and embed it
  const i18nPath = path.join(
    context.extensionPath,
    'src',
    'ui',
    'webview',
    'l10n',
    'i18n.ts'
  );
  let i18nScript = '';
  try {
    const i18nContent = fs.readFileSync(i18nPath, 'utf8');
    // Convert TypeScript to JavaScript (basic conversion for webview)
    i18nScript = convertTStoJS(i18nContent);
  } catch (error) {
    console.warn('Could not load i18n script:', error);
    i18nScript = '// i18n not available';
  }

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

  // Replace i18n script placeholder with initialization
  const i18nWithInit = `${i18nScript}\n\n// Initialize i18n when DOM is ready\nif (typeof i18n !== 'undefined') { i18n.init(); }`;
  html = html.replace('{{I18N_SCRIPT}}', i18nWithInit);

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
