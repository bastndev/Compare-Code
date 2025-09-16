import * as vscode from 'vscode';
import { createCompareView, closeCompareView, isViewOpen } from './ui/compareView';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('compare-code.compareFiles', async () => {
		try {
			if (isViewOpen()) {
				// Si está abierto, lo cerramos
				await closeCompareView();
			} else {
				// Si no está abierto, lo creamos/mostramos
				await createCompareView();
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Error al manejar la vista de comparación: ${error}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	// Limpiar recursos al desactivar la extensión
	closeCompareView();
}