import * as vscode from 'vscode';
import * as path from 'path';

/* ======================================
   WEBVIEW ICONS - VS Code Extension | MARK: ICONS
   ======================================= */

export interface DynamicIconManager {
  updateIcons(): void;
  dispose(): void;
}

// ======================================
// Icon Generation | MARK: GENERATION
// ======================================

export function getWebviewIcons(
  context: vscode.ExtensionContext,
  webview: vscode.Webview
) {
  const theme = vscode.window.activeColorTheme;
  const themeFolder =
    theme.kind === vscode.ColorThemeKind.Light ? 'light' : 'dark';

  const createIconUri = (iconName: string) => {
    const iconPath = vscode.Uri.file(
      path.join(
        context.extensionPath,
        'assets',
        'icons',
        themeFolder,
        `${iconName}.svg`
      )
    );
    return webview.asWebviewUri(iconPath).toString();
  };

  return {
    warning: createIconUri('warning'),
    play: createIconUri('play'),
    stop: createIconUri('stop'),
    panelLeft: createIconUri('panel-left'),
    panelRight: createIconUri('panel-right'),
    dualScroll: createIconUri('dual-scroll'),
    earthCode: createIconUri('earth-code'),
    language: createIconUri('language'),
    onlyCode: createIconUri('only-code'),
    switchOff: createIconUri('switch-off'),
    switchOn: createIconUri('switch-on'),
    clear: createIconUri('clear'),
    copy: createIconUri('copy'),
    download: createIconUri('download'),
  };
}

// ======================================
// Dynamic Icon Manager | MARK: MANAGER
// ======================================

export function createDynamicIconManager(
  context: vscode.ExtensionContext,
  webview: vscode.Webview
): DynamicIconManager {
  let themeChangeListener: vscode.Disposable | undefined;

  const updateIcons = () => {
    const icons = getWebviewIcons(context, webview);
    webview.postMessage({
      command: 'updateIcons',
      icons: icons,
    });
  };

  themeChangeListener = vscode.window.onDidChangeActiveColorTheme(() => {
    updateIcons();
  });

  return {
    updateIcons,
    dispose: () => {
      if (themeChangeListener) {
        themeChangeListener.dispose();
        themeChangeListener = undefined;
      }
    },
  };
}

// ======================================
// HTML Processing | MARK: HTML
// ======================================

export function replaceIconsInHtml(
  html: string,
  icons: ReturnType<typeof getWebviewIcons>
): string {
  let processedHtml = html;

  processedHtml = processedHtml.replace(/\{\{WARNING_ICON\}\}/g, icons.warning);
  processedHtml = processedHtml.replace(/\{\{PLAY_ICON\}\}/g, icons.play);
  processedHtml = processedHtml.replace(/\{\{STOP_ICON\}\}/g, icons.stop);
  processedHtml = processedHtml.replace(
    /\{\{PANEL_LEFT_ICON\}\}/g,
    icons.panelLeft
  );
  processedHtml = processedHtml.replace(
    /\{\{PANEL_RIGHT_ICON\}\}/g,
    icons.panelRight
  );
  processedHtml = processedHtml.replace(
    /\{\{DUAL_SCROLL_ICON\}\}/g,
    icons.dualScroll
  );
  processedHtml = processedHtml.replace(
    /\{\{LANGUAGE_ICON\}\}/g,
    icons.language
  );
  processedHtml = processedHtml.replace(
    /\{\{ONLY_CODE_ICON\}\}/g,
    icons.onlyCode
  );
  processedHtml = processedHtml.replace(
    /\{\{SWITCH_ON_ICON\}\}/g,
    icons.switchOn
  );
  processedHtml = processedHtml.replace(
    /\{\{SWITCH_OFF_ICON\}\}/g,
    icons.switchOff
  );
  processedHtml = processedHtml.replace(
    /\{\{EARTH_CODE_ICON\}\}/g,
    icons.earthCode
  );
  processedHtml = processedHtml.replace(/\{\{CLEAR_ICON_L\}\}/g, icons.clear);
  processedHtml = processedHtml.replace(/\{\{CLEAR_ICON_R\}\}/g, icons.clear);
  processedHtml = processedHtml.replace(/\{\{COPY_ICON_R\}\}/g, icons.copy);
  processedHtml = processedHtml.replace(/\{\{COPY_ICON_L\}\}/g, icons.copy);
  processedHtml = processedHtml.replace(
    /\{\{DOWNLOAD_ICON_R\}\}/g,
    icons.download
  );
  processedHtml = processedHtml.replace(
    /\{\{DOWNLOAD_ICON_L\}\}/g,
    icons.download
  );

  return processedHtml;
}

// ======================================
// Theme Utilities | MARK: THEME
// ======================================

export function getThemeInfo(): { kind: vscode.ColorThemeKind; name: string } {
  const theme = vscode.window.activeColorTheme;
  return {
    kind: theme.kind,
    name:
      theme.kind === vscode.ColorThemeKind.Light
        ? 'light'
        : theme.kind === vscode.ColorThemeKind.Dark
        ? 'dark'
        : 'high-contrast',
  };
}
