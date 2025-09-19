import * as vscode from 'vscode';
import * as path from 'path';

export function getWebviewIcons(context: vscode.ExtensionContext, webview: vscode.Webview) {
    const warningPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'warning.svg'));
    const warningUri = webview.asWebviewUri(warningPath);

    const playPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'play.svg'));
    const playUri = webview.asWebviewUri(playPath);

    const on1Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on1.svg'));
    const on1Uri = webview.asWebviewUri(on1Path);

    const on2Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on2.svg'));
    const on2Uri = webview.asWebviewUri(on2Path);

    const on3Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on3.svg'));
    const on3Uri = webview.asWebviewUri(on3Path);

    const on4Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on4.svg'));
    const on4Uri = webview.asWebviewUri(on4Path);

    return {
        warning: warningUri.toString(),
        play: playUri.toString(),
        on1: on1Uri.toString(),
        on2: on2Uri.toString(),
        on3: on3Uri.toString(),
        on4: on4Uri.toString(),
    };
}

export function replaceIconsInHtml(html: string, icons: ReturnType<typeof getWebviewIcons>): string {
    let processedHtml = html;
    
    processedHtml = processedHtml.replace('{{WARNING_ICON}}', icons.warning);
    processedHtml = processedHtml.replace('{{PLAY_ICON}}', icons.play);
    processedHtml = processedHtml.replace('{{ON1_ICON}}', icons.on1);
    processedHtml = processedHtml.replace('{{ON2_ICON}}', icons.on2);
    processedHtml = processedHtml.replace('{{ON3_ICON}}', icons.on3);
    processedHtml = processedHtml.replace('{{ON4_ICON}}', icons.on4);
    
    return processedHtml;
}
