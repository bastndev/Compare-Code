import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import {
  getWebviewIcons,
  replaceIconsInHtml,
} from './webview/view/webviewIcons';

// ======================================
// COMPARE VIEW MANAGER | MARK: MANAGER
// ======================================

let comparePanel: vscode.WebviewPanel | undefined;

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
 * Create i18n JavaScript script for webview injection
 */
function createI18nScript(translations: Record<string, any>): string {
  return `
// ======================================
// I18N SERVICE FOR WEBVIEW | MARK: I18N
// ======================================
(function() {
  const translations = ${JSON.stringify(translations, null, 2)};
  let currentLanguage = 'en';
  
  function detectLanguage() {
    try {
      const vscodeLocale = window.vscode?.env?.language;
      if (vscodeLocale) {
        return mapLanguageCode(vscodeLocale);
      }
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      return mapLanguageCode(browserLang);
    } catch (error) {
      console.warn('Could not detect language:', error);
      return 'en';
    }
  }
  
  function mapLanguageCode(langCode) {
    const code = langCode.toLowerCase().split('-')[0];
    switch (code) {
      case 'es': return 'es';
      case 'pt': return 'pt';
      case 'zh': return 'zh';
      case 'en':
      default: return 'en';
    }
  }
  
  function t(keyPath, ...args) {
    try {
      const keys = keyPath.split('.');
      let value = translations[currentLanguage];
      
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
      
      if (typeof value !== 'string') {
        console.warn('Translation not found for key:', keyPath);
        return keyPath;
      }
      
      return value.replace(/\\{(\\d+)\\}/g, (match, index) => {
        const argIndex = parseInt(index, 10);
        return args[argIndex] !== undefined ? args[argIndex] : match;
      });
    } catch (error) {
      console.error('Error getting translation for', keyPath, ':', error);
      return keyPath;
    }
  }
  
  function setLanguage(language) {
    if (translations[language]) {
      currentLanguage = language;
      updateUI();
      try {
        localStorage.setItem('compareCode.language', language);
      } catch (error) {
        console.warn('Could not save language preference:', error);
      }
    }
  }
  
  function getCurrentLanguage() {
    return currentLanguage;
  }
  
  function updateUI() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translatedText = t(key);
        const attr = element.getAttribute('data-i18n-attr');
        if (attr) {
          element.setAttribute(attr, translatedText);
        } else {
          element.textContent = translatedText;
        }
      }
    });
    
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: currentLanguage }
    }));
  }
  
  function init() {
    try {
      const savedLang = localStorage.getItem('compareCode.language');
      if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
      } else {
        currentLanguage = detectLanguage();
      }
    } catch (error) {
      console.warn('Could not load language preference:', error);
      currentLanguage = detectLanguage();
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateUI);
    } else {
      updateUI();
    }
  }
  
  window.i18n = {
    t: t,
    setLanguage: setLanguage,
    getCurrentLanguage: getCurrentLanguage,
    init: init
  };
  
  init();
})();
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

  let i18nScript = '';
  try {
    const translations = loadTranslations(context.extensionPath);
    i18nScript = createI18nScript(translations);
  } catch (error) {
    console.warn('Could not load translations:', error);
    i18nScript = '// i18n not available';
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
  html = html.replace('{{I18N_SCRIPT}}', i18nScript);
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
