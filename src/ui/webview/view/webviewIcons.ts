import * as vscode from 'vscode';
import * as path from 'path';

export function getWebviewIcons(context: vscode.ExtensionContext, webview: vscode.Webview) {
    // Detect the current VSCode theme
    const theme = vscode.window.activeColorTheme;
    const themeFolder = theme.kind === vscode.ColorThemeKind.Light ? 'light' : 'dark';
    
    // Helper function to create icon URIs based on the theme
    const createIconUri = (iconName: string) => {
        const iconPath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'icons', themeFolder, `${iconName}.svg`)
        );
        return webview.asWebviewUri(iconPath).toString();
    };

    return {
        // Main icons
        warning: createIconUri('warning'),
        play: createIconUri('play'),
        panelLeft: createIconUri('panel-left'),
        panelRight: createIconUri('panel-right'),

        // Bottom bar icons
        dualScroll: createIconUri('dual-scroll'),
        earthCode: createIconUri('earth-code'),
        language: createIconUri('language'),
        onlyCode: createIconUri('only-code'),
        switchOff: createIconUri('switch-off'),
        switchOn: createIconUri('switch-on'),

        // Utility icons
        clear: createIconUri('clear'),
        copy: createIconUri('copy'),
    };
}

export function replaceIconsInHtml(html: string, icons: ReturnType<typeof getWebviewIcons>): string {
    let processedHtml = html;
    
    // Main icons
    processedHtml = processedHtml.replace(/\{\{WARNING_ICON\}\}/g, icons.warning);
    processedHtml = processedHtml.replace(/\{\{PLAY_ICON\}\}/g, icons.play);
    processedHtml = processedHtml.replace(/\{\{PANEL_LEFT_ICON\}\}/g, icons.panelLeft);
    processedHtml = processedHtml.replace(/\{\{PANEL_RIGHT_ICON\}\}/g, icons.panelRight);

    // Bottom bar icons
    processedHtml = processedHtml.replace(/\{\{DUAL_SCROLL_ICON\}\}/g, icons.dualScroll);
    processedHtml = processedHtml.replace(/\{\{LANGUAGE_ICON\}\}/g, icons.language);
    processedHtml = processedHtml.replace(/\{\{ONLY_CODE_ICON\}\}/g, icons.onlyCode);
    processedHtml = processedHtml.replace(/\{\{SWITCH_OFF_ICON\}\}/g, icons.switchOff);
    processedHtml = processedHtml.replace(/\{\{SWITCH_ON_ICON\}\}/g, icons.switchOn);
    processedHtml = processedHtml.replace(/\{\{EARTH_CODE_ICON\}\}/g, icons.earthCode);

    // Utility icons (may appear multiple times)
    processedHtml = processedHtml.replace(/\{\{CLEAR_ICON_L\}\}/g, icons.clear);
    processedHtml = processedHtml.replace(/\{\{CLEAR_ICON_R\}\}/g, icons.clear);
    processedHtml = processedHtml.replace(/\{\{COPY_ICON_R\}\}/g, icons.copy);
    processedHtml = processedHtml.replace(/\{\{COPY_ICON_L\}\}/g, icons.copy);

    return processedHtml;
}

// Optional function to get current theme information
export function getThemeInfo(): { kind: vscode.ColorThemeKind; name: string } {
    const theme = vscode.window.activeColorTheme;
    return {
        kind: theme.kind,
        name: theme.kind === vscode.ColorThemeKind.Light ? 'light' : 
              theme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'high-contrast'
    };
}