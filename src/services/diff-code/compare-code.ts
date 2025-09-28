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

// Initialize the compare grid functionality
export function initializeCompareGrid(): void {
  updateLineNumbers('code-editor-left', 'line-numbers-left');
  updateLineNumbers('code-editor-right', 'line-numbers-right');
}

export {};
