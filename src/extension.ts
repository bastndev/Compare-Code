import * as vscode from 'vscode';

const NEW_EXTENSION_ID = 'bastndev.atm';

export async function activate(_context: vscode.ExtensionContext) {
  if (!vscode.extensions.getExtension(NEW_EXTENSION_ID)) {
    try {
      await vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        NEW_EXTENSION_ID
      );
    } catch {
      // ignore — the notification button still lets the user open the page
    }
  }

  const selection = await vscode.window.showWarningMessage(
    'Bracket Lynx is deprecated and has been integrated into ATM. Please uninstall this extension and use ATM instead.',
    'Open ATM'
  );

  if (selection === 'Open ATM') {
    await vscode.env.openExternal(
      vscode.Uri.parse(`vscode:extension/${NEW_EXTENSION_ID}`)
    );
  }
}
