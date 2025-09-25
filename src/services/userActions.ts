/* ======================================
   Clear & close/open panel R-L | MARK: TOOLBAR
   ======================================= */

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

// CLEAR ALL CODE
function initializeClearButton(): void {
  const clearBtn = document.querySelector('.clear') as HTMLElement;
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ['code-editor-left', 'code-editor-right'].forEach((id) => {
        const editor = document.getElementById(id) as HTMLTextAreaElement;
        if (editor) {
          editor.value = '';
          editor.dispatchEvent(new Event('input'));
        }
      });
    });
  }
}

 // CLOSE PANEL RIGHT AND LEFT
function initializePanelLeftButton(): void {
  const btn = document.getElementById('btn-panel-left') as HTMLElement;
  if (btn) {
    btn.addEventListener('click', () => {
      vscode.postMessage({ command: 'toggleLeftPanel' });
    });
  }
}

function initializePanelRightButton(): void {
  const btn = document.getElementById('btn-panel-right') as HTMLElement;
  if (btn) {
    btn.addEventListener('click', () => {
      vscode.postMessage({ command: 'toggleRightPanel' });
    });
  }
}

/* ======================================
   Copy & Clear | MARK: diff-panel
   ======================================= */

// Handles copy functionality for individual panels
function initializeCopyButtons(): void {
  // Get all copy buttons
  const copyButtons = document.querySelectorAll(
    '.copy-code'
  ) as NodeListOf<HTMLElement>;

  copyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Find the closest editor panel to determine which textarea to copy from
      const editorPanel = button.closest(
        '.editor-panel-left, .editor-panel-right'
      );

      if (editorPanel) {
        // Determine which editor based on panel class
        const isLeftPanel = editorPanel.classList.contains('editor-panel-left');
        const editorId = isLeftPanel ? 'code-editor-left' : 'code-editor-right';
        const editor = document.getElementById(editorId) as HTMLTextAreaElement;

        if (editor && editor.value.trim()) {
          // Copy to clipboard
          navigator.clipboard
            .writeText(editor.value)
            .then(() => {
              // Optional: Show feedback (you can add visual feedback later)
              console.log(
                `Code copied from ${isLeftPanel ? 'left' : 'right'} panel`
              );
            })
            .catch((err) => {
              console.error('Failed to copy code:', err);
            });
        }
      }
    });
  });
}

// Handles clear functionality for individual panels
function initializeClearCodeButtons(): void {
  // Get all clear-code buttons
  const clearButtons = document.querySelectorAll(
    '.clear-code'
  ) as NodeListOf<HTMLElement>;

  clearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Find the closest editor panel to determine which textarea to clear
      const editorPanel = button.closest(
        '.editor-panel-left, .editor-panel-right'
      );

      if (editorPanel) {
        // Determine which editor based on panel class
        const isLeftPanel = editorPanel.classList.contains('editor-panel-left');
        const editorId = isLeftPanel ? 'code-editor-left' : 'code-editor-right';
        const editor = document.getElementById(editorId) as HTMLTextAreaElement;

        if (editor) {
          editor.value = '';
          // Trigger input event to update line numbers
          editor.dispatchEvent(new Event('input'));
        }
      }
    });
  });
}

/**
 * Initialize all user action handlers
 */
export function initializeUserActions(): void {
  initializeClearButton();
  initializeCopyButtons();
  initializeClearCodeButtons();
  initializePanelLeftButton();
  initializePanelRightButton();
  // TODO: Add other button handlers here
  // initializeCompareButton();
  // initializePanelControls();
  // initializeBottomBarButtons();
}

export {};
