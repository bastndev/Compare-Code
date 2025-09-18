import * as vscode from 'vscode';
import * as path from 'path';

export function getWebviewIcons(context: vscode.ExtensionContext, webview: vscode.Webview) {
    const icon1Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on1.svg'));
    const icon1Uri = webview.asWebviewUri(icon1Path);
    
    const icon2Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on2.svg'));
    const icon2Uri = webview.asWebviewUri(icon2Path);
    
    const icon3Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on3.svg'));
    const icon3Uri = webview.asWebviewUri(icon3Path);
    
    const icon4Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on4.svg'));
    const icon4Uri = webview.asWebviewUri(icon4Path);
    
    const icon5Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on5.svg'));
    const icon5Uri = webview.asWebviewUri(icon5Path);
    
    const icon6Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on6.svg'));
    const icon6Uri = webview.asWebviewUri(icon6Path);
    
    const icon7Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'on7.svg'));
    const icon7Uri = webview.asWebviewUri(icon7Path);

    return {
        icon1: icon1Uri.toString(),
        icon2: icon2Uri.toString(),
        icon3: icon3Uri.toString(),
        icon4: icon4Uri.toString(),
        icon5: icon5Uri.toString(),
        icon6: icon6Uri.toString(),
        icon7: icon7Uri.toString()
    };
}

export function replaceIconsInHtml(html: string, icons: ReturnType<typeof getWebviewIcons>): string {
    let processedHtml = html;
    
    processedHtml = processedHtml.replace('{{ICON_URI_1}}', icons.icon1);
    processedHtml = processedHtml.replace('{{ICON_URI_2}}', icons.icon2);
    processedHtml = processedHtml.replace('{{ICON_URI_3}}', icons.icon3);
    processedHtml = processedHtml.replace('{{ICON_URI_4}}', icons.icon4);
    processedHtml = processedHtml.replace('{{ICON_URI_5}}', icons.icon5);
    processedHtml = processedHtml.replace('{{ICON_URI_6}}', icons.icon6);
    processedHtml = processedHtml.replace('{{ICON_URI_7}}', icons.icon7);
    
    return processedHtml;
}