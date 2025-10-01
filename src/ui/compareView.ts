import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import {
  getWebviewIcons,
  replaceIconsInHtml,
  createDynamicIconManager,
  DynamicIconManager,
} from './webview/view/webviewIcons';

// ======================================
// COMPARE VIEW MANAGER | MARK: MANAGER
// ======================================

let comparePanel: vscode.WebviewPanel | undefined;
let iconManager: DynamicIconManager | undefined;

// ======================================
// TRANSLATIONS | MARK: I18N
// ======================================

/**
 * Load all translation files
 */
function loadTranslations(extensionPath: string): Record<string, any> {
  const translations: Record<string, any> = {};
  const languages = ['en', 'es', 'pt', 'zh'];

  for (const lang of languages) {
    try {
      const translationPath = path.join(
        extensionPath,
        'src',
        'ui',
        'webview',
        'l10n',
        `${lang}.json`
      );
      const content = fs.readFileSync(translationPath, 'utf8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load ${lang} translations:`, error);
    }
  }

  return translations;
}

/**
 * Create i18n initialization script for webview
 */
function createI18nInitScript(translations: Record<string, any>): string {
  return `
// ======================================
// I18N INITIALIZATION | MARK: I18N_INIT
// ======================================
if (typeof window.i18n !== 'undefined') {
  const translations = ${JSON.stringify(translations, null, 2)};
  window.i18n.init(translations);
} else {
  console.warn('i18n service not loaded');
}
`;
}

// ======================================
// WEBVIEW MANAGEMENT | MARK: WEBVIEW
// ======================================

/**
 * Creates or shows the compare view
 */
export async function createCompareView(
  context: vscode.ExtensionContext
): Promise<void> {
  if (comparePanel) {
    comparePanel.reveal(vscode.ViewColumn.One);
    return;
  }

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

  // Crear el manager de iconos dinámicos
  iconManager = createDynamicIconManager(context, comparePanel.webview);

  comparePanel.webview.onDidReceiveMessage(async (message) => {
    const config = vscode.workspace.getConfiguration('workbench');
    const location = config.get('sideBar.location');

    switch (message.command) {
      case 'toggleLeftPanel':
        if (location === 'left') {
          await vscode.commands.executeCommand(
            'workbench.action.toggleSidebarVisibility'
          );
        } else {
          await vscode.commands.executeCommand(
            'workbench.action.toggleAuxiliaryBar'
          );
        }
        break;
      case 'toggleRightPanel':
        if (location === 'left') {
          await vscode.commands.executeCommand(
            'workbench.action.toggleAuxiliaryBar'
          );
        } else {
          await vscode.commands.executeCommand(
            'workbench.action.toggleSidebarVisibility'
          );
        }
        break;
      case 'downloadCode':
        await handleCodeDownload(message.content, message.panel);
        break;
      case 'changeLanguage':
        console.log(`Language changed to: ${message.language}`);
        break;
    }
  });

  comparePanel.onDidDispose(() => {
    if (iconManager) {
      iconManager.dispose();
      iconManager = undefined;
    }
    comparePanel = undefined;
  });
}

/**
 * Closes the compare view if open
 */
export async function closeCompareView(): Promise<void> {
  if (comparePanel) {
    comparePanel.dispose();
    comparePanel = undefined;
  }
  if (iconManager) {
    iconManager.dispose();
    iconManager = undefined;
  }
}

/**
 * Checks if the view is currently open
 */
export function isViewOpen(): boolean {
  return comparePanel !== undefined && comparePanel.visible;
}

// ======================================
// HTML GENERATION | MARK: HTML
// ======================================

/**
 * Generates HTML content for the webview
 */
function getWebviewContent(
  context: vscode.ExtensionContext,
  webview: vscode.Webview
): string {
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

  const scriptPath = vscode.Uri.file(
    path.join(context.extensionPath, 'dist', 'main.js')
  );
  const scriptUri = webview.asWebviewUri(scriptPath);

  const iconUpdaterPath = vscode.Uri.file(
    path.join(
      context.extensionPath,
      'src',
      'ui',
      'webview',
      'scripts',
      'iconUpdater.js'
    )
  );
  const iconUpdaterUri = webview.asWebviewUri(iconUpdaterPath);

  const i18nPath = vscode.Uri.file(
    path.join(
      context.extensionPath,
      'src',
      'ui',
      'webview',
      'scripts',
      'i18n.js'
    )
  );
  const i18nUri = webview.asWebviewUri(i18nPath);

  let i18nInitScript = '';
  try {
    const translations = loadTranslations(context.extensionPath);
    i18nInitScript = createI18nInitScript(translations);
  } catch (error) {
    console.warn('Could not load translations:', error);
    i18nInitScript = '// i18n not available';
  }

  const icons = getWebviewIcons(context, webview);

  const htmlPath = path.join(
    context.extensionPath,
    'src',
    'ui',
    'webview',
    'view',
    'index.html'
  );
  let html = fs.readFileSync(htmlPath, 'utf8');

  html = html.replace('{{CSS_URI}}', cssUri.toString());
  html = html.replace('{{SCRIPT_URI}}', scriptUri.toString());
  html = html.replace('{{ICON_UPDATER_URI}}', iconUpdaterUri.toString());
  html = html.replace('{{I18N_URI}}', i18nUri.toString());
  html = html.replace('{{I18N_SCRIPT}}', i18nInitScript);
  html = replaceIconsInHtml(html, icons);

  const iconMessage = {
    type: 'setIcons',
    icons: {
      play: icons.play,
      stop: icons.stop,
      switchOn: icons.switchOn,
      switchOff: icons.switchOff,
    },
  };
  webview.postMessage(iconMessage);

  return html;
}

// ======================================
// FILE OPERATIONS | MARK: FILES
// ======================================

/**
 * Handle code download from webview securely using VS Code API
 */
async function handleCodeDownload(
  content: string,
  panel: string
): Promise<void> {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const filename = `code-${panel}-${dateStr}.txt`;

    const downloadsPath = path.join(os.homedir(), 'Downloads');
    const defaultUri = vscode.Uri.file(path.join(downloadsPath, filename));

    const saveUri = await vscode.window.showSaveDialog({
      defaultUri: defaultUri,
      filters: {
        'Text Files': ['txt'],
        'All Files': ['*'],
      },
    });

    if (saveUri) {
      const buffer = Buffer.from(content, 'utf8');
      await vscode.workspace.fs.writeFile(saveUri, buffer);

      vscode.window.showInformationMessage(
        `Code from ${panel} panel saved to Downloads!`
      );
    }
  } catch (error) {
    console.error('Download failed:', error);
    vscode.window.showErrorMessage(
      `Failed to save code: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
