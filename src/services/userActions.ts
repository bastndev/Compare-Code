/* ======================================
   Clear | MARK: TOOLBAR
   ======================================= */
function initializeClearButton(): void {
    const clearBtn = document.querySelector('.clear') as HTMLElement;
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            ['code-editor-left', 'code-editor-right'].forEach(id => {
                const editor = document.getElementById(id) as HTMLTextAreaElement;
                if (editor) {
                    editor.value = '';
                    editor.dispatchEvent(new Event('input'));
                }
            });
        });
    }
}

/* ======================================
   Copy & Clear | MARK: diff-panel
   ======================================= */


/**
 * Initialize all user action handlers
 */
export function initializeUserActions(): void {
    initializeClearButton();
    // TODO: Add other button handlers here
    // initializeCopyButtons();
    // initializeCompareButton();
    // initializePanelControls();
    // initializeBottomBarButtons();
}

export {};