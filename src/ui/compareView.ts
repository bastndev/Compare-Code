import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import {
  getWebviewIcons,
  replaceIconsInHtml,
} from './webview/view/webviewIcons';

/**
 * Load all translation files
 * @param extensionPath Path to the extension
 * @returns Object with all translations
 */
function loadTranslations(extensionPath: string): Record<string, any> {
  const translations: Record<string, any> = {};
  const languages = ['en', 'es', 'pt', 'zh'];
  
  for (const lang of languages) {
    try {
      const translationPath = path.join(extensionPath, 'src', 'ui', 'webview', 'l10n', `${lang}.json`);
      const content = fs.readFileSync(translationPath, 'utf8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load ${lang} translations:`, error);
    }
  }
  
  return translations;
}

/**
 * Create a simple i18n JavaScript script
 * @param translations All translations
 * @returns JavaScript code as string
 */
function createI18nScript(translations: Record<string, any>): string {
  return `
// Simple i18n service for webview
(function() {
  const translations = ${JSON.stringify(translations, null, 2)};
  let currentLanguage = 'en';
  
  // Detect language from VS Code or browser
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
      
      // Replace placeholders {0}, {1}, etc.
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
    // Update all elements with data-i18n attributes
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translatedText = t(key);
        
        // Update text content or specific attributes
        const attr = element.getAttribute('data-i18n-attr');
        if (attr) {
          element.setAttribute(attr, translatedText);
        } else {
          element.textContent = translatedText;
        }
      }
    });
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: currentLanguage }
    }));
  }
  
  function init() {
    // Load saved language preference
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
    
    // Update UI when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateUI);
    } else {
      updateUI();
    }
  }
  
  // Create global i18n object
  window.i18n = {
    t: t,
    setLanguage: setLanguage,
    getCurrentLanguage: getCurrentLanguage,
    init: init
  };
  
  // Initialize immediately
  init();
  
  console.log('i18n service initialized with languages:', Object.keys(translations));
})();
`;
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

  // Load translation files and create i18n script
  let i18nScript = '';
  try {
    const translations = loadTranslations(context.extensionPath);
    i18nScript = createI18nScript(translations);
  } catch (error) {
    console.warn('Could not load translations:', error);
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
  const iconMessage = { type: 'setIcons', icons: { play: icons.play, stop: icons.stop, switchOn: icons.switchOn, switchOff: icons.switchOff } };
  console.log('Sending icons to webview:', iconMessage);
  webview.postMessage(iconMessage);

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
