import { ComparisonLine, LineType } from './compare-code';

// ==========================================
// UI MANAGEMENT & DOM MANIPULATION
// ==========================================

/**
 * Manages the complete UI state for both code editors
 */
export class EditorManager {
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

  public clearAll(): void {
    this.editor1.clearContent();
    this.editor2.clearContent();
  }
}

/**
 * Manages individual editor instance UI behavior
 */
export class EditorInstance {
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

  // ==========================================
  // INITIALIZATION & EVENT HANDLING
  // ==========================================

  private initializeEditor(): void {
    this.updateLineNumbers();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Text input events
    this.textareaElement.addEventListener('input', () => this.updateLineNumbers());
    this.textareaElement.addEventListener('scroll', () => this.syncEditScroll());
    this.textareaElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      e.preventDefault();
      this.insertTab();
    }
  }

  // ==========================================
  // TEXT EDITING FUNCTIONALITY
  // ==========================================

  private insertTab(): void {
    const textarea = this.textareaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const value = textarea.value;
    textarea.value = value.substring(0, start) + '    ' + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 4;
    
    this.updateLineNumbers();
  }

  public getContent(): string {
    return this.textareaElement.value;
  }

  public setContent(content: string): void {
    this.textareaElement.value = content;
    this.updateLineNumbers();
  }

  public clearContent(): void {
    this.textareaElement.value = '';
    this.updateLineNumbers();
  }

  // ==========================================
  // LINE NUMBERS MANAGEMENT
  // ==========================================

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

  private updateComparisonLineNumbers(lineCount: number): void {
    let numbersHTML = '';
    for (let i = 1; i <= Math.max(lineCount, 1); i++) {
      numbersHTML += i + '\n';
    }
    this.lineNumbersElement.textContent = numbersHTML;
  }

  // ==========================================
  // SCROLL SYNCHRONIZATION
  // ==========================================

  private syncEditScroll(): void {
    this.lineNumbersElement.scrollTop = this.textareaElement.scrollTop;
  }

  private syncCompareScroll(): void {
    this.displayElement.addEventListener('scroll', () => {
      this.lineNumbersElement.scrollTop = this.displayElement.scrollTop;
    });
  }

  // ==========================================
  // MODE SWITCHING
  // ==========================================

  public setEditMode(): void {
    this.unifiedEditor.classList.remove('mode-compare');
    this.unifiedEditor.classList.add('mode-edit');
    this.updateLineNumbers();
  }

  public setCompareMode(lines: ComparisonLine[]): void {
    this.unifiedEditor.classList.remove('mode-edit');
    this.unifiedEditor.classList.add('mode-compare');
    this.renderComparison(lines);
    this.syncCompareScroll();
  }

  // ==========================================
  // COMPARISON RENDERING
  // ==========================================

  private renderComparison(lines: ComparisonLine[]): void {
    let html = '';
    lines.forEach(line => {
      const cssClass = this.getLineCssClass(line.type);
      html += `<div class="diff-line ${cssClass}">${this.escapeHtml(line.content)}</div>`;
    });

    this.displayElement.innerHTML = html;
    this.updateComparisonLineNumbers(lines.length);
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

  // ==========================================
  // HTML UTILITIES
  // ==========================================

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