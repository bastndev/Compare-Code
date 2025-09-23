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

    //----- ---- --- -- -  Bottom bar | ICONS
    const dualScrollPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'dual-scroll.svg'));
    const dualScrollUri = webview.asWebviewUri(dualScrollPath);

    const earthCodePath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'earth-code.svg'));
    const earthCodeUri = webview.asWebviewUri(earthCodePath);

    const languagePath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'language.svg'));
    const languageUri = webview.asWebviewUri(languagePath);

    const onlyCode2Path = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'only-code-2.svg'));
    const onlyCode2Uri = webview.asWebviewUri(onlyCode2Path);

    const onlyCodePath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'only-code.svg'));
    const onlyCodeUri = webview.asWebviewUri(onlyCodePath);

    const switchOffPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'switch-off.svg'));
    const switchOffUri = webview.asWebviewUri(switchOffPath);

    const switchOnPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'switch-on.svg'));
    const switchOnUri = webview.asWebviewUri(switchOnPath);

    const refreshPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'refresh.svg'));
    const refreshUri = webview.asWebviewUri(refreshPath);

    const clearPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'clear.svg'));
    const clearUri = webview.asWebviewUri(clearPath);

    const copyPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'icons', 'copy.svg'));
    const copyUri = webview.asWebviewUri(copyPath);

    return {
        warning: warningUri.toString(),
        play: playUri.toString(),
        panelLeft: panelLeftUri.toString(),
        panelRight: panelRightUri.toString(),

        dualScroll: dualScrollUri.toString(),
        earthCode: earthCodeUri.toString(),
        language: languageUri.toString(),
        onlyCode2: onlyCode2Uri.toString(),
        onlyCode: onlyCodeUri.toString(),
        switchOff: switchOffUri.toString(),
        switchOn: switchOnUri.toString(),
        refresh: refreshUri.toString(),

        clear: clearUri.toString(),
        copy: copyUri.toString(),
    };
}

export function replaceIconsInHtml(html: string, icons: ReturnType<typeof getWebviewIcons>): string {
    let processedHtml = html;
    
    processedHtml = processedHtml.replace('{{WARNING_ICON}}', icons.warning);
    processedHtml = processedHtml.replace('{{PLAY_ICON}}', icons.play);
    processedHtml = processedHtml.replace('{{PANEL_LEFT_ICON}}', icons.panelLeft);
    processedHtml = processedHtml.replace('{{PANEL_RIGHT_ICON}}', icons.panelRight);

    processedHtml = processedHtml.replace('{{DUAL_SCROLL_ICON}}', icons.dualScroll);
    processedHtml = processedHtml.replace('{{LANGUAGE_ICON}}', icons.language);
    processedHtml = processedHtml.replace('{{ONLY_CODE_2_ICON}}', icons.onlyCode2);
    processedHtml = processedHtml.replace('{{ONLY_CODE_ICON}}', icons.onlyCode);
    processedHtml = processedHtml.replace('{{SWITCH_OFF_ICON}}', icons.switchOff);
    processedHtml = processedHtml.replace('{{SWITCH_ON_ICON}}', icons.switchOn);
    processedHtml = processedHtml.replace('{{EARTH_CODE_ICON}}', icons.earthCode);
    processedHtml = processedHtml.replace('{{REFRESH_ICON}}', icons.refresh);

    processedHtml = processedHtml.replace('{{CLEAR_ICON}}', icons.clear);
    processedHtml = processedHtml.replace('{{COPY_ICON}}', icons.copy);

    return processedHtml;
}
