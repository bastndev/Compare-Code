import * as vscode from 'vscode';
import * as path from 'path';

export function getWebviewIcons(context: vscode.ExtensionContext, webview: vscode.Webview) {
    const warningPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'warning.svg'));
    const warningUri = webview.asWebviewUri(warningPath);

    return {
        icon1: warningUri.toString(),
    };
}

export function replaceIconsInHtml(html: string, icons: ReturnType<typeof getWebviewIcons>): string {
    let processedHtml = html;
    
    processedHtml = processedHtml.replace('{{WARNING_ICON}}', icons.icon1);
    
    return processedHtml;
}