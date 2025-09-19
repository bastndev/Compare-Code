import * as vscode from 'vscode';
import * as path from 'path';

export function getWebviewIcons(context: vscode.ExtensionContext, webview: vscode.Webview) {
    const warningPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'warning.svg'));
    const warningUri = webview.asWebviewUri(warningPath);

    const playPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'play.svg'));
    const playUri = webview.asWebviewUri(playPath);

    const panelLeftPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'panel-left.svg'));
    const panelLeftUri = webview.asWebviewUri(panelLeftPath);

    const panelRightPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'panel-right.svg'));
    const panelRightUri = webview.asWebviewUri(panelRightPath);

    return {
        warning: warningUri.toString(),
        play: playUri.toString(),
        panelLeft: panelLeftUri.toString(),
        panelRight: panelRightUri.toString(),
    };
}

export function replaceIconsInHtml(html: string, icons: ReturnType<typeof getWebviewIcons>): string {
    let processedHtml = html;
    
    processedHtml = processedHtml.replace('{{WARNING_ICON}}', icons.warning);
    processedHtml = processedHtml.replace('{{PLAY_ICON}}', icons.play);
    processedHtml = processedHtml.replace('{{PANEL_LEFT_ICON}}', icons.panelLeft);
    processedHtml = processedHtml.replace('{{PANEL_RIGHT_ICON}}', icons.panelRight);
    
    return processedHtml;
}
