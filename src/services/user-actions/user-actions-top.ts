/* ======================================
   Clear & close/open panel R-L | MARK: TOOLBAR
   ======================================= */

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

// Global variable to store icon URIs received from extension
let iconUris: { play: string; stop: string } | null = null;

// Listen for messages from extension to set icon URIs
window.addEventListener('message', (event) => {
  if (event.data.type === 'setIcons') {
    iconUris = event.data.icons;
  }
});

/* ======================================
   toolbar | MARK: CLEAR  
   ======================================= */
function initializeClearButton(): void {
  const clearBtn = document.querySelector('.clear') as HTMLElement;
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ['codeInput1', 'codeInput2'].forEach((id) => {
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
    if (img && iconUris) {
      img.src = iconUris.stop; // dynamic ICON
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
    if (img && iconUris) {
      img.src = iconUris.play; // dynamic ICON
    }
    if (span) {
      span.textContent = 'Compare';
    }
    playBtn.classList.remove('stop');
  }
}

/* ======================================
   diff-panel| MARK: Copy/Clear/DW  
   ======================================= */

// COPY CODE
function initializeCopyButtons(): void {
  // Get all copy buttons
  const copyButtons = document.querySelectorAll(
    '.copy-code'
  ) as NodeListOf<HTMLElement>;

  copyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Determine which panel based on parent container
      const isLeftPanel = button.closest('.options-panel-left') !== null;
      const editorId = isLeftPanel ? 'codeInput1' : 'codeInput2';
      const editor = document.getElementById(editorId) as HTMLTextAreaElement;

      if (editor && editor.value.trim()) {
        // Copy to clipboard
        navigator.clipboard
          .writeText(editor.value)
          .then(() => {
            // Add success animation
            button.classList.add('copying');
            setTimeout(() => {
              button.classList.remove('copying');
            }, 300);

            console.log(
              `Code copied from ${isLeftPanel ? 'left' : 'right'} panel`
            );
          })
          .catch((err) => {
            console.error('Failed to copy code:', err);
          });
      }
    });
  });
}

// DOWNLOAD CODE - Secure version using VS Code API
function initializeDownloadButtons(): void {
  // Get all download buttons
  const downloadButtons = document.querySelectorAll(
    '.download-code'
  ) as NodeListOf<HTMLElement>;

  downloadButtons.forEach((button) => {
    button.addEventListener('click', () => {
      console.log('Download button clicked'); // Debug log
      
      // Determine which panel based on parent container
      const isLeftPanel = button.closest('.options-panel-left') !== null;
      const editorId = isLeftPanel ? 'codeInput1' : 'codeInput2';
      const editor = document.getElementById(editorId) as HTMLTextAreaElement;

      console.log(`Looking for editor: ${editorId}, found:`, !!editor); // Debug log
      
      if (editor) {
        const content = editor.value.trim();
        console.log(`Content length: ${content.length}`); // Debug log
        
        if (content) {
          // Send message to extension to handle download securely
          // Always save as .txt file with today's date
          vscode.postMessage({
            command: 'downloadCode',
            content: content,
            panel: isLeftPanel ? 'left' : 'right',
            fileExtension: 'txt' // Always txt format
          });

          // Add success animation
          button.classList.add('downloading');
          setTimeout(() => {
            button.classList.remove('downloading');
          }, 500);

          console.log(`Download request sent for ${isLeftPanel ? 'left' : 'right'} panel`);
        } else {
          console.log('No content to download');
          // Visual feedback for empty content
          button.style.opacity = '0.5';
          setTimeout(() => {
            button.style.opacity = '1';
          }, 300);
        }
      } else {
        console.error(`Editor not found: ${editorId}`);
      }
    });
  });
}

// CLEAR - RIGHT & LEFT
function initializeClearCodeButtons(): void {
  // Get all clear-code buttons
  const clearButtons = document.querySelectorAll(
    '.clear-code'
  ) as NodeListOf<HTMLElement>;

  clearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Determine which panel based on parent container
      const isLeftPanel = button.closest('.options-panel-left') !== null;
      const editorId = isLeftPanel ? 'codeInput1' : 'codeInput2';
      const editor = document.getElementById(editorId) as HTMLTextAreaElement;

      if (editor) {
        const hasContent = editor.value.trim() !== '';

        // Only show animation if there's content to clear
        if (hasContent) {
          button.classList.add('clearing');
        }

        editor.value = '';
        // Trigger input event to update line numbers
        editor.dispatchEvent(new Event('input'));

        // If in compare mode, reset to edit mode
        const playBtn = document.getElementById('playBtn') as HTMLElement;
        if (playBtn && playBtn.classList.contains('stop')) {
          (window as any).toggle();
        }

        // Remove animation class after animation completes (only if it was added)
        if (hasContent) {
          setTimeout(() => {
            button.classList.remove('clearing');
          }, 500);
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
  initializeDownloadButtons();
  initializeClearCodeButtons();
  initializePanelLeftButton();
  initializePanelRightButton();
}

export {};
