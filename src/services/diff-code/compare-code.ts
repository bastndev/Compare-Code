let isComparing: boolean = false;

export function toggle(): void {
  if (isComparing) {
    reset();
  } else {
    compare();
  }
}

export function compare(): void {
  const code1Element = document.getElementById('code1') as HTMLTextAreaElement;
  const code2Element = document.getElementById('code2') as HTMLTextAreaElement;
  const code1 = code1Element.value;
  const code2 = code2Element.value;

  if (!code1.trim() && !code2.trim()) {
    alert('Please enter code in at least one field');
    return;
  }

  const lines1 = code1.split('\n').map(line => line.trimEnd());
  const lines2 = code2.split('\n').map(line => line.trimEnd());
  const maxLines = Math.max(lines1.length, lines2.length);

  let html1 = '', html2 = '';

  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || '';
    const line2 = lines2[i] || '';

    if (line1 === line2) {
      html1 += `<span class="code-line">${esc(line1)}</span>\n`;
      html2 += `<span class="code-line">${esc(line2)}</span>\n`;
    } else {
      if (line1 && !line2) {
        html1 += `<span class="code-line removed">${esc(line1)}</span>\n`;
        html2 += `<span class="code-line empty-line"> </span>\n`;
      } else if (!line1 && line2) {
        html1 += `<span class="code-line empty-line"> </span>\n`;
        html2 += `<span class="code-line added">${esc(line2)}</span>\n`;
      } else {
        html1 += `<span class="code-line modified">${esc(line1)}</span>\n`;
        html2 += `<span class="code-line modified">${esc(line2)}</span>\n`;
      }
    }
  }

  const display1 = document.getElementById('display1') as HTMLElement;
  const display2 = document.getElementById('display2') as HTMLElement;
  display1.innerHTML = html1;
  display2.innerHTML = html2;

  document.querySelectorAll('.code-input').forEach((el) => (el as HTMLElement).style.display = 'none');
  document.querySelectorAll('.code-display').forEach((el) => (el as HTMLElement).style.display = 'block');

  const playBtn = document.getElementById('playBtn') as HTMLElement;
  playBtn.textContent = 'Edit';
  isComparing = true;
}

export function reset(): void {
  document.querySelectorAll('.code-input').forEach((el) => (el as HTMLElement).style.display = 'block');
  document.querySelectorAll('.code-display').forEach((el) => (el as HTMLElement).style.display = 'none');

  const playBtn = document.getElementById('playBtn') as HTMLElement;
  playBtn.textContent = 'Compare';
  isComparing = false;
}

function esc(str: string): string {
  return str.replace(/[&<>"']/g, (m: string) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

export function initializeCompareCode(): void {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') { toggle(); }
    if (e.key === 'Escape') { reset(); }
  });
}