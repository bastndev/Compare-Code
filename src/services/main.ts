import { initializeUserActions } from './userActions';

// Very simplified version - only the essentials
function updateLineNumbers(textareaId: string, lineNumbersId: string): void {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
  const lineNumbers = document.getElementById(lineNumbersId) as HTMLElement;

  if (!textarea || !lineNumbers) {
    return;
  }

  function update(): void {
    const text = textarea.value || textarea.placeholder || '';
    const lines = text.split('\n').length;
    lineNumbers.textContent = Array.from(
      { length: lines },
      (_, i) => i + 1
    ).join('\n');
    lineNumbers.scrollTop = textarea.scrollTop;
  }

  textarea.addEventListener('input', update);
  textarea.addEventListener(
    'scroll',
    () => (lineNumbers.scrollTop = textarea.scrollTop)
  );

  update(); // Initial
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  updateLineNumbers('code-editor-left', 'line-numbers-left');
  updateLineNumbers('code-editor-right', 'line-numbers-right');

  // HERE - userActions
  initializeUserActions();
});

export {};
