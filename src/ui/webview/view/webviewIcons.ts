import * as vscode from 'vscode';
import * as path from 'path';

export function getWebviewIcons(context: vscode.ExtensionContext, webview: vscode.Webview) {
    const warningPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'warning.svg'));
    const warningUri = webview.asWebviewUri(warningPath);

    // Add URIs for all "on" icons
    const on1Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on1.svg'));
    const on1Uri = webview.asWebviewUri(on1Path);

    const on2Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on2.svg'));
    const on2Uri = webview.asWebviewUri(on2Path);

    const on3Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on3.svg'));
    const on3Uri = webview.asWebviewUri(on3Path);

    const on4Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on4.svg'));
    const on4Uri = webview.asWebviewUri(on4Path);

    const on5Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on5.png'));
    const on5Uri = webview.asWebviewUri(on5Path);

    const on6Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on6.png'));
    const on6Uri = webview.asWebviewUri(on6Path);

    const on7Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on7.svg'));
    const on7Uri = webview.asWebviewUri(on7Path);

    const on8Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on8.svg'));
    const on8Uri = webview.asWebviewUri(on8Path);

    return {
        icon1: warningUri.toString(),
        on1: on1Uri.toString(),
        on2: on2Uri.toString(),
        on3: on3Uri.toString(),
        on4: on4Uri.toString(),
        on5: on5Uri.toString(),
        on6: on6Uri.toString(),
        on7: on7Uri.toString(),
        on8: on8Uri.toString(),
    };
}

export function replaceIconsInHtml(html: string, icons: ReturnType<typeof getWebviewIcons>): string {
    let processedHtml = html;
    
    processedHtml = processedHtml.replace('{{WARNING_ICON}}', icons.icon1);
    processedHtml = processedHtml.replace('{{ON1_ICON}}', icons.on1);
    processedHtml = processedHtml.replace('{{ON2_ICON}}', icons.on2);
    processedHtml = processedHtml.replace('{{ON3_ICON}}', icons.on3);
    processedHtml = processedHtml.replace('{{ON4_ICON}}', icons.on4);
    processedHtml = processedHtml.replace('{{ON5_ICON}}', icons.on5);
    processedHtml = processedHtml.replace('{{ON6_ICON}}', icons.on6);
    processedHtml = processedHtml.replace('{{ON7_ICON}}', icons.on7);
    processedHtml = processedHtml.replace('{{ON8_ICON}}', icons.on8);
    
    return processedHtml;
}