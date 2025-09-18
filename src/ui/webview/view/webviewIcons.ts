import * as vscode from 'vscode';
import * as path from 'path';

export function getWebviewIcons(context: vscode.ExtensionContext, webview: vscode.Webview) {
    const warningPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'warning.svg'));
    const warningUri = webview.asWebviewUri(warningPath);

    const playPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'play.svg'));
    const playUri = webview.asWebviewUri(playPath);

    return {
        warning: warningUri.toString(),
        play: playUri.toString(),
    };
}

export function replaceIconsInHtml(html: string, icons: ReturnType<typeof getWebviewIcons>): string {
    let processedHtml = html;
    
    processedHtml = processedHtml.replace('{{WARNING_ICON}}', icons.warning);
    processedHtml = processedHtml.replace('{{PLAY_ICON}}', icons.play);
    
    return processedHtml;
}
