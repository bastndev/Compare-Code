/* ======================================
   Clear & close/open panel R-L | MARK: TOOLBAR
   ======================================= */

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

/* ======================================
   toolbar | MARK: CLEAR  
   ======================================= */
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
   toolbar | MARK: playBtn
   ======================================= */
export function setPlayBtnToEdit(): void {
  const playBtn = document.getElementById('playBtn') as HTMLElement;
  if (playBtn) {
    const img = playBtn.querySelector('img') as HTMLImageElement;
    const span = playBtn.querySelector('span') as HTMLSpanElement;
    if (img) {
      img.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-player-stop"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" fill="white"/></svg>');
    }
    if (span) {
      span.textContent = 'Stop';
    }
    playBtn.classList.add('stop');
  }
}

export function setPlayBtnToCompare(): void {
  const playBtn = document.getElementById('playBtn') as HTMLElement;
  if (playBtn) {
    const img = playBtn.querySelector('img') as HTMLImageElement;
    const span = playBtn.querySelector('span') as HTMLSpanElement;
    if (img) {
      img.src = 'data:image/svg+xml;base64,' + btoa('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z" fill="white"/></svg>');
    }
    if (span) {
      span.textContent = 'Compare';
    }
    playBtn.classList.remove('stop');
  }
}

/* ======================================
   diff-panel| MARK: Copy & Clear  
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
}

export {};
