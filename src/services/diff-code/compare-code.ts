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

  // Comparación línea por línea
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] !== undefined ? lines1[i] : '';
    const line2 = lines2[i] !== undefined ? lines2[i] : '';

    if (line1 === line2) {
      // Líneas idénticas
      html1 += `<div class="code-line"><span class="code-line-content">${esc(line1)}</span></div>`;
      html2 += `<div class="code-line"><span class="code-line-content">${esc(line2)}</span></div>`;
    } else {
      // Líneas diferentes
      if (line1 !== '' && line2 === '') {
        // Línea removida (solo existe en código 1)
        html1 += `<div class="code-line removed"><span class="code-line-content">${esc(line1)}</span></div>`;
        html2 += `<div class="code-line empty-line"><span class="code-line-content"></span></div>`;
      } else if (line1 === '' && line2 !== '') {
        // Línea añadida (solo existe en código 2)
        html1 += `<div class="code-line empty-line"><span class="code-line-content"></span></div>`;
        html2 += `<div class="code-line added"><span class="code-line-content">${esc(line2)}</span></div>`;
      } else {
        // Líneas modificadas (ambas existen pero son diferentes)
        html1 += `<div class="code-line modified"><span class="code-line-content">${esc(line1)}</span></div>`;
        html2 += `<div class="code-line modified"><span class="code-line-content">${esc(line2)}</span></div>`;
      }
    }
  }

  // Actualizar displays
  const display1 = document.getElementById('display1') as HTMLElement;
  const display2 = document.getElementById('display2') as HTMLElement;
  
  if (!display1 || !display2) {
    console.error('No se encontraron los elementos de display');
    return;
  }

  display1.innerHTML = html1;
  display2.innerHTML = html2;

  // Cambiar visibilidad
  showComparisonMode();
  
  // Actualizar botón
  setPlayBtnToEdit();
  isComparing = true;
}

export function reset(): void {
  showEditMode();
  setPlayBtnToCompare();
  isComparing = false;
}

function showComparisonMode(): void {
  const codeInputs = document.querySelectorAll('.code-input');
  const codeDisplays = document.querySelectorAll('.code-display');
  
  codeInputs.forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
  
  codeDisplays.forEach((el) => {
    (el as HTMLElement).style.display = 'block';
  });
}

function showEditMode(): void {
  const codeInputs = document.querySelectorAll('.code-input');
  const codeDisplays = document.querySelectorAll('.code-display');
  
  codeInputs.forEach((el) => {
    (el as HTMLElement).style.display = 'block';
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

export function initializeCompareCode(): void {
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