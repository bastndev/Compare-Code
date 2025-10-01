// ======================================
// USER ACTIONS TOP | MARK: TOP
// ======================================

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

let iconUris: { play: string; stop: string } | null = null;

window.addEventListener('message', (event) => {
  if (event.data.type === 'setIcons') {
    iconUris = event.data.icons;
  }
});

// ======================================
// TOOLBAR ACTIONS | MARK: TOOLBAR
// ======================================

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

// ======================================
// PLAY BUTTON | MARK: PLAY
// ======================================

export function setPlayBtnToEdit(): void {
  const playBtn = document.getElementById('playBtn') as HTMLElement;
  if (playBtn) {
    const img = playBtn.querySelector('img') as HTMLImageElement;
    const span = playBtn.querySelector('span') as HTMLSpanElement;
    if (img && iconUris) {
      img.src = iconUris.stop;
    }
    if (span) {
      span.textContent = (window as any).i18n?.t('buttons.stop') || 'Stop';
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
      img.src = iconUris.play;
    }
    if (span) {
      span.textContent = (window as any).i18n?.t('buttons.compare') || 'Compare';
    }
    playBtn.classList.remove('stop');
  }
}

// ======================================
// PANEL ACTIONS | MARK: PANELS
// ======================================

function initializeCopyButtons(): void {
  const copyButtons = document.querySelectorAll(
    '.copy-code'
  ) as NodeListOf<HTMLElement>;

  copyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isLeftPanel = button.closest('.options-panel-left') !== null;
      const editorId = isLeftPanel ? 'codeInput1' : 'codeInput2';
      const editor = document.getElementById(editorId) as HTMLTextAreaElement;

      if (editor && editor.value.trim()) {
        navigator.clipboard
          .writeText(editor.value)
          .then(() => {
            button.classList.add('copying');
            setTimeout(() => {
              button.classList.remove('copying');
            }, 2000);
          })
          .catch((err) => {
            console.error('Failed to copy code:', err);
          });
      }
    });
  });
}

function initializeClearCodeButtons(): void {
  const clearButtons = document.querySelectorAll(
    '.clear-code'
  ) as NodeListOf<HTMLElement>;

  clearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isLeftPanel = button.closest('.options-panel-left') !== null;
      const editorId = isLeftPanel ? 'codeInput1' : 'codeInput2';
      const editor = document.getElementById(editorId) as HTMLTextAreaElement;

      if (editor) {
        const hasContent = editor.value.trim() !== '';

        if (hasContent) {
          button.classList.add('clearing');
        }

        editor.value = '';
        editor.dispatchEvent(new Event('input'));

        const playBtn = document.getElementById('playBtn') as HTMLElement;
        if (playBtn && playBtn.classList.contains('stop')) {
          (window as any).toggle();
        }

        if (hasContent) {
          setTimeout(() => {
            button.classList.remove('clearing');
          }, 500);
        }
      }
    });
  });
}

function initializeDownloadButtons(): void {
  const downloadButtons = document.querySelectorAll(
    '.download-code'
  ) as NodeListOf<HTMLElement>;

  downloadButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isLeftPanel = button.closest('.options-panel-left') !== null;
      const editorId = isLeftPanel ? 'codeInput1' : 'codeInput2';
      const editor = document.getElementById(editorId) as HTMLTextAreaElement;

      if (editor) {
        const content = editor.value.trim();

        if (content) {
          vscode.postMessage({
            command: 'downloadCode',
            content: content,
            panel: isLeftPanel ? 'left' : 'right',
            fileExtension: 'txt',
          });

          button.classList.add('downloading');
          setTimeout(() => {
            button.classList.remove('downloading');
          }, 500);
        } else {
          button.style.opacity = '0.5';
          setTimeout(() => {
            button.style.opacity = '1';
          }, 300);
        }
      }
    });
  });
}

// ======================================
// INITIALIZATION | MARK: INIT
// ======================================

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