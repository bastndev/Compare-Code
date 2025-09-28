let isComparing: boolean = false;

import { setPlayBtnToEdit, setPlayBtnToCompare } from '../user-actions/user-actions-top';

export function toggle(): void {
  if (isComparing) {
    reset();
  } else {
    compare();
  }
}

export function compare(): void {
  const codeBox1Element = document.getElementById('codeBox1') as HTMLTextAreaElement;
  const codeBox2Element = document.getElementById('codeBox2') as HTMLTextAreaElement;
  
  if (!codeBox1Element || !codeBox2Element) {
    console.error('Code box Element no found');
    return;
  }

  const codeBox1 = codeBox1Element.value;
  const codeBox2 = codeBox2Element.value;

  if (!codeBox1.trim() && !codeBox2.trim()) {
    alert('Please enter code in at least one field');
    return;
  }

  const lines1 = codeBox1.split('\n');
  const lines2 = codeBox2.split('\n');
  const maxLines = Math.max(lines1.length, lines2.length);

  let html1 = '', html2 = '';

  // Line Compare
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] !== undefined ? lines1[i] : '';
    const line2 = lines2[i] !== undefined ? lines2[i] : '';

    if (line1 === line2) {
      // Identical lines
      html1 += `<div class="code-line"><span class="code-line-content">${esc(line1)}</span></div>`;
      html2 += `<div class="code-line"><span class="code-line-content">${esc(line2)}</span></div>`;
    } else {
      // Different lines
      if (line1 !== '' && line2 === '') {
        // Removed line (only exists in code 1)
        html1 += `<div class="code-line removed"><span class="code-line-content">${esc(line1)}</span></div>`;
        html2 += `<div class="code-line empty-line"><span class="code-line-content"></span></div>`;
      } else if (line1 === '' && line2 !== '') {
        // Added line (only exists in code 2)
        html1 += `<div class="code-line empty-line"><span class="code-line-content"></span></div>`;
        html2 += `<div class="code-line added"><span class="code-line-content">${esc(line2)}</span></div>`;
      } else {
        // Modified lines (both exist but are different)
        html1 += `<div class="code-line modified"><span class="code-line-content">${esc(line1)}</span></div>`;
        html2 += `<div class="code-line modified"><span class="code-line-content">${esc(line2)}</span></div>`;
      }
    }
  }

  // Update displays
  const display1 = document.getElementById('display1') as HTMLElement;
  const display2 = document.getElementById('display2') as HTMLElement;
  
  if (!display1 || !display2) {
    console.error('Display elements not found');
    return;
  }

  display1.innerHTML = html1;
  display2.innerHTML = html2;

  // Change visibility
  showComparisonMode();
  
  // Update button
  setPlayBtnToEdit();
  isComparing = true;
}

export function reset(): void {
  showEditMode();
  setPlayBtnToCompare();
  isComparing = false;
}

function showComparisonMode(): void {
  const codeInputContainers = document.querySelectorAll('.code-input-container');
  const codeDisplays = document.querySelectorAll('.code-display');
  
  codeInputContainers.forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
  
  codeDisplays.forEach((el) => {
    (el as HTMLElement).style.display = 'block';
  });
}

function showEditMode(): void {
  const codeInputContainers = document.querySelectorAll('.code-input-container');
  const codeDisplays = document.querySelectorAll('.code-display');
  
  codeInputContainers.forEach((el) => {
    (el as HTMLElement).style.display = 'flex';
  });
  
  codeDisplays.forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
}

function esc(str: string): string {
  if (!str) {
    return '';
  }
  
  const escapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return str.replace(/[&<>"']/g, (match) => escapeMap[match]);
}

// ===========================================
// FUNCTION TO UPDATE LINE NUMBERS IN REAL TIME
// ===========================================
function updateLineNumbers(textareaId: string, lineNumbersId: string): void {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
  const lineNumbers = document.getElementById(lineNumbersId) as HTMLElement;
  
  if (!textarea || !lineNumbers) {
    return;
  }

  const lines = textarea.value.split('\n');
  const lineCount = lines.length;
  
  let numbersHTML = '';
  for (let i = 1; i <= lineCount; i++) {
    numbersHTML += i + '\n';
  }
  
  lineNumbers.textContent = numbersHTML;
  
  // Synchronize scroll
  lineNumbers.scrollTop = textarea.scrollTop;
}

// Function to synchronize scroll between textarea and line numbers
function syncScroll(textareaId: string, lineNumbersId: string): void {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
  const lineNumbers = document.getElementById(lineNumbersId) as HTMLElement;
  
  if (!textarea || !lineNumbers){
     return;
  }
  
  lineNumbers.scrollTop = textarea.scrollTop;
}

export function initializeCompareCode(): void {
  // Create containers and line numbers for both text area
  const codeBox1 = document.getElementById('codeBox1') as HTMLTextAreaElement;
  const codeBox2 = document.getElementById('codeBox2') as HTMLTextAreaElement;
  
  if (codeBox1 && codeBox2) {
    // Wrap codeBox1
    wrapTextareaWithLineNumbers(codeBox1, 'codeBox1');
    // Wrap codeBox2
    wrapTextareaWithLineNumbers(codeBox2, 'codeBox2');
  }

  // Event listeners for keyboard
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
    
    if (e.key === 'Escape') {
      e.preventDefault();
      reset();
    }
  });
}

function wrapTextareaWithLineNumbers(textarea: HTMLTextAreaElement, textareaId: string): void {
  const parent = textarea.parentElement;
  if (!parent) {
    return;
  }

  // Create container
  const container = document.createElement('div');
  container.className = 'code-input-container';
  
  // Create line numbers
  const lineNumbers = document.createElement('div');
  lineNumbers.className = 'line-numbers';
  lineNumbers.id = `lineNumbers${textareaId}`;
  lineNumbers.textContent = '1\n';
  
  // Insert container before the textarea
  parent.insertBefore(container, textarea);
  
  // Move textarea to the container
  container.appendChild(lineNumbers);
  container.appendChild(textarea);
  
  // Event listeners to update line numbers
  textarea.addEventListener('input', () => {
    updateLineNumbers(textareaId, `lineNumbers${textareaId}`);
  });
  
  textarea.addEventListener('scroll', () => {
    syncScroll(textareaId, `lineNumbers${textareaId}`);
  });
  
  // Initialize line numbers
  updateLineNumbers(textareaId, `lineNumbers${textareaId}`);
}