import * as vscode from 'vscode';

let compareDocument: vscode.TextDocument | undefined;

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('compare-code.compareFiles', async () => {
		const openEditors = vscode.window.visibleTextEditors;
		const isOpen = compareDocument && openEditors.some(editor => editor.document === compareDocument);

		if (isOpen) {
			// Cerrar solo el documento específico
			const editor = openEditors.find(editor => editor.document === compareDocument);
			if (editor) {
				await vscode.window.showTextDocument(editor.document);
				await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
			}
			compareDocument = undefined;
		} else {
			// Abrir o crear el documento
			if (!compareDocument) {
				compareDocument = await vscode.workspace.openTextDocument({
					content: '',
					language: 'plaintext'
				});
			}
			await vscode.window.showTextDocument(compareDocument);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	// Limpiar referencias al desactivar
	compareDocument = undefined;
}