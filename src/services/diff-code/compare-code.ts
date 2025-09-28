import { setPlayBtnToEdit, setPlayBtnToCompare } from '../user-actions/user-actions-top';

// ==========================================
// HYBRID ARCHITECTURE - Best of Both Worlds
// ==========================================

let isComparing: boolean = false;

interface ComparisonStats {
  added: number;
  removed: number;
  modified: number;
}

class EditorManager {
  private editor1: EditorInstance;
  private editor2: EditorInstance;
  
  constructor() {
    this.editor1 = new EditorInstance('1');
    this.editor2 = new EditorInstance('2');
  }

  public getContent(editorId: '1' | '2'): string {
    return editorId === '1' ? this.editor1.getContent() : this.editor2.getContent();
  }

  public setEditMode(): void {
    this.editor1.setEditMode();
    this.editor2.setEditMode();
  }

  public setCompareMode(lines1: ComparisonLine[], lines2: ComparisonLine[]): void {
    this.editor1.setCompareMode(lines1);
    this.editor2.setCompareMode(lines2);
  }

  public updateLineNumbers(): void {
    this.editor1.updateLineNumbers();
    this.editor2.updateLineNumbers();
  }
}

class EditorInstance {
  private editorId: string;
  private textareaElement: HTMLTextAreaElement;
  private displayElement: HTMLElement;
  private lineNumbersElement: HTMLElement;
  private unifiedEditor: HTMLElement;

  constructor(id: string) {
    this.editorId = id;
    this.textareaElement = document.getElementById(`codeInput${id}`) as HTMLTextAreaElement;
    this.displayElement = document.getElementById(`codeDisplay${id}`) as HTMLElement;
    this.lineNumbersElement = document.getElementById(`lineNumbers${id}`) as HTMLElement;
    this.unifiedEditor = document.getElementById(`editor${id}`) as HTMLElement;

    if (!this.textareaElement || !this.displayElement || !this.lineNumbersElement || !this.unifiedEditor) {
      throw new Error(`Editor elements not found for editor ${id}`);
    }

    this.initializeEditor();
  }

  private initializeEditor(): void {
    // Initialize line numbers
    this.updateLineNumbers();

    // Event listeners
    this.textareaElement.addEventListener('input', () => this.updateLineNumbers());
    this.textareaElement.addEventListener('scroll', () => this.syncScroll());

    // Tab key handling
    this.textareaElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      e.preventDefault();
      this.insertTab();
    }
  }

  private insertTab(): void {
    const textarea = this.textareaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const value = textarea.value;
    textarea.value = value.substring(0, start) + '    ' + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 4;
    
    this.updateLineNumbers();
  }

  private syncScroll(): void {
    this.lineNumbersElement.scrollTop = this.textareaElement.scrollTop;
  }

  public updateLineNumbers(): void {
    const content = this.textareaElement.value;
    const lines = content.split('\n');
    const lineCount = Math.max(lines.length, 1);
    
    let numbersHTML = '';
    for (let i = 1; i <= lineCount; i++) {
      numbersHTML += i + '\n';
    }
    
    this.lineNumbersElement.textContent = numbersHTML;
  }

  public getContent(): string {
    return this.textareaElement.value;
  }

  public setContent(content: string): void {
    this.textareaElement.value = content;
    this.updateLineNumbers();
  }

  public setEditMode(): void {
    this.unifiedEditor.classList.remove('mode-compare');
    this.unifiedEditor.classList.add('mode-edit');
    this.updateLineNumbers();
  }

  public setCompareMode(lines: ComparisonLine[]): void {
    this.unifiedEditor.classList.remove('mode-edit');
    this.unifiedEditor.classList.add('mode-compare');
    this.renderComparison(lines);
    
    // Sync scroll after rendering
    this.syncDisplayScroll();
  }

  private syncDisplayScroll(): void {
    // Add scroll listener to display element when in compare mode
    this.displayElement.addEventListener('scroll', () => {
      this.lineNumbersElement.scrollTop = this.displayElement.scrollTop;
    });
  }

  private renderComparison(lines: ComparisonLine[]): void {
    let html = '';
    lines.forEach(line => {
      const cssClass = this.getLineCssClass(line.type);
      html += `<div class="diff-line ${cssClass}">${this.escapeHtml(line.content)}</div>`;
    });

    this.displayElement.innerHTML = html;
    this.updateComparisonLineNumbers(lines.length);
  }

  private updateComparisonLineNumbers(lineCount: number): void {
    let numbersHTML = '';
    for (let i = 1; i <= Math.max(lineCount, 1); i++) {
      numbersHTML += i + '\n';
    }
    this.lineNumbersElement.textContent = numbersHTML;
  }

  private getLineCssClass(type: LineType): string {
    switch (type) {
      case 'added': return 'added';
      case 'removed': return 'removed';
      case 'modified': return 'modified';
      case 'empty': return 'empty';
      default: return 'identical';
    }
  }

  private escapeHtml(text: string): string {
    if (!text) {
      return '';
    }
    
    const escapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, (match) => escapeMap[match]);
  }
}

// ==========================================
// COMPARISON ENGINE
// ==========================================

type LineType = 'identical' | 'added' | 'removed' | 'modified' | 'empty';

interface ComparisonLine {
  content: string;
  type: LineType;
}

class ComparisonEngine {
  public static compare(text1: string, text2: string): {
    lines1: ComparisonLine[];
    lines2: ComparisonLine[];
    stats: ComparisonStats;
  } {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);

    const result1: ComparisonLine[] = [];
    const result2: ComparisonLine[] = [];
    const stats: ComparisonStats = { added: 0, removed: 0, modified: 0 };

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] !== undefined ? lines1[i] : '';
      const line2 = lines2[i] !== undefined ? lines2[i] : '';

      if (line1 === line2) {
        // Identical lines
        result1.push({ content: line1, type: 'identical' });
        result2.push({ content: line2, type: 'identical' });
      } else {
        // Different lines
        if (line1 !== '' && line2 === '') {
          // Removed line (only exists in code 1)
          result1.push({ content: line1, type: 'removed' });
          result2.push({ content: '', type: 'empty' });
          stats.removed++;
        } else if (line1 === '' && line2 !== '') {
          // Added line (only exists in code 2)
          result1.push({ content: '', type: 'empty' });
          result2.push({ content: line2, type: 'added' });
          stats.added++;
        } else {
          // Modified lines (both exist but are different)
          result1.push({ content: line1, type: 'modified' });
          result2.push({ content: line2, type: 'modified' });
          stats.modified++;
        }
      }
    }

    return { lines1: result1, lines2: result2, stats };
  }
}

// ==========================================
// MAIN APPLICATION
// ==========================================

let editorManager: EditorManager;

export function toggle(): void {
  if (isComparing) {
    reset();
  } else {
    compare();
  }
}

export function compare(): void {
  try {
    if (!editorManager) {
      console.error('Editor manager not initialized');
      return;
    }

    const text1 = editorManager.getContent('1');
    const text2 = editorManager.getContent('2');

    if (!text1.trim() && !text2.trim()) {
      alert('Please enter code in at least one field');
      return;
    }

    // Perform comparison
    const comparison = ComparisonEngine.compare(text1, text2);
    
    // Switch to compare mode
    editorManager.setCompareMode(comparison.lines1, comparison.lines2);

    // Update UI state
    isComparing = true;
    setPlayBtnToEdit();
    updateStatsDisplay(comparison.stats);

  } catch (error) {
    console.error('Comparison failed:', error);
    alert('An error occurred during comparison. Please try again.');
  }
}

export function reset(): void {
  try {
    if (!editorManager) {
      console.error('Editor manager not initialized');
      return;
    }

    // Return to edit mode
    editorManager.setEditMode();

    // Update UI state
    isComparing = false;
    setPlayBtnToCompare();
    clearStatsDisplay();

  } catch (error) {
    console.error('Reset failed:', error);
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function updateStatsDisplay(stats: ComparisonStats): void {
  const addedElement = document.getElementById('added-count');
  const removedElement = document.getElementById('removed-count');
  const modifiedElement = document.getElementById('modified-count');
  
  if (addedElement) addedElement.textContent = `${stats.added} lines added`;
  if (removedElement) removedElement.textContent = `${stats.removed} lines removed`;
  if (modifiedElement) modifiedElement.textContent = `${stats.modified} lines modified`;
}

function clearStatsDisplay(): void {
  const addedElement = document.getElementById('added-count');
  const removedElement = document.getElementById('removed-count');
  const modifiedElement = document.getElementById('modified-count');
  
  if (addedElement) addedElement.textContent = '0 lines added';
  if (removedElement) removedElement.textContent = '0 lines removed';
  if (modifiedElement) modifiedElement.textContent = '0 lines modified';
}

// Clear all content
export function clearAll(): void {
  if (editorManager) {
    const editor1 = editorManager as any;
    const editor2 = editorManager as any;
    
    // Access private editors through the manager
    const textarea1 = document.getElementById('codeInput1') as HTMLTextAreaElement;
    const textarea2 = document.getElementById('codeInput2') as HTMLTextAreaElement;
    
    if (textarea1) {
      textarea1.value = '';
      editorManager.updateLineNumbers();
    }
    if (textarea2) {
      textarea2.value = '';
      editorManager.updateLineNumbers();
    }
    
    // Reset to edit mode if in comparison
    if (isComparing) {
      reset();
    }
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

export function initializeCompareCode(): void {
  try {
    // Initialize editor manager
    editorManager = new EditorManager();

    // Global keyboard shortcuts
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

    console.log('Compare Code initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize Compare Code:', error);
  }
}