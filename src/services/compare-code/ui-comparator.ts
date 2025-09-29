import { ComparisonLine, LineType } from './algorithms';

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
    
    // Window resize event to recalculate wrapped lines
    window.addEventListener('resize', () => this.updateLineNumbers());
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
  // LINE NUMBERS MANAGEMENT WITH WORD WRAP
  // ==========================================

  public updateLineNumbers(): void {
    if (this.unifiedEditor.classList.contains('mode-compare')) {
      // In compare mode, line numbers are handled by updateComparisonLineNumbers
      return;
    }

    const content = this.textareaElement.value;
    const logicalLines = content.split('\n');
    const lineCount = Math.max(logicalLines.length, 1);
    
    // Calculate visual lines considering word wrap
    const visualLineHeights = this.calculateVisualLines(logicalLines, this.textareaElement);
    
    // Generate line numbers HTML with proper spacing
    let numbersHTML = '';
    for (let i = 0; i < lineCount; i++) {
      const logicalLineNumber = i + 1;
      const visualHeight = visualLineHeights[i];
      
      // Create line number with appropriate height to match wrapped content
      numbersHTML += this.createLineNumberElement(logicalLineNumber, visualHeight);
    }
    
    this.lineNumbersElement.innerHTML = numbersHTML;
  }

  private calculateVisualLines(logicalLines: string[], container: HTMLElement): number[] {
    const visualHeights: number[] = [];
    
    // Create a temporary element to measure text wrapping
    const measurer = document.createElement('div');
    measurer.style.cssText = `
      position: absolute;
      visibility: hidden;
      height: auto;
      width: ${container.clientWidth - 10}px;
      font-family: ${window.getComputedStyle(container).fontFamily};
      font-size: ${window.getComputedStyle(container).fontSize};
      line-height: ${window.getComputedStyle(container).lineHeight};
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      padding: 0;
      margin: 0;
      border: 0;
    `;
    document.body.appendChild(measurer);

    logicalLines.forEach(line => {
      measurer.textContent = line || ' '; // Empty lines need at least a space
      const height = measurer.offsetHeight;
      const lineHeight = parseFloat(window.getComputedStyle(container).lineHeight);
      const visualLines = Math.max(1, Math.round(height / lineHeight));
      visualHeights.push(visualLines);
    });

    document.body.removeChild(measurer);
    return visualHeights;
  }

  private createLineNumberElement(lineNumber: number, visualLines: number, className?: string): string {
    const lineHeight = 1.4; // em units
    const totalHeight = visualLines * lineHeight;
    
    // Center the line number vertically if the content spans multiple visual lines
    const centerOffset = visualLines > 1 ? (totalHeight - lineHeight) / 2 : 0;
    
    const classAttr = className ? ` class="line-number-item ${className}"` : ' class="line-number-item"';
    return `<div${classAttr} style="height: ${totalHeight}em; line-height: ${lineHeight}em; padding-top: ${centerOffset}em;">${lineNumber}</div>`;
  }

  private updateComparisonLineNumbers(lines: ComparisonLine[]): void {
    // Calculate visual lines for comparison mode
    const visualHeights = this.calculateComparisonVisualLines(lines);
    
    let numbersHTML = '';
    for (let i = 0; i < lines.length; i++) {
      const logicalLineNumber = i + 1;
      const visualLines = visualHeights[i];
      const className = this.getLineCssClass(lines[i].type);
      numbersHTML += this.createLineNumberElement(logicalLineNumber, visualLines, className);
    }
    
    this.lineNumbersElement.innerHTML = numbersHTML;
  }

  private calculateComparisonVisualLines(lines: ComparisonLine[]): number[] {
    const visualHeights: number[] = [];
    
    // Create a temporary element to measure text wrapping for comparison display
    const measurer = document.createElement('div');
    measurer.style.cssText = `
      position: absolute;
      visibility: hidden;
      height: auto;
      width: ${this.displayElement.clientWidth - 10}px;
      font-family: ${window.getComputedStyle(this.displayElement).fontFamily};
      font-size: ${window.getComputedStyle(this.displayElement).fontSize};
      line-height: ${window.getComputedStyle(this.displayElement).lineHeight};
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      padding: 0;
      margin: 0;
      border: 0;
    `;
    document.body.appendChild(measurer);

    lines.forEach(line => {
      measurer.textContent = line.content || ' '; // Empty lines need at least a space
      const height = measurer.offsetHeight;
      const lineHeight = parseFloat(window.getComputedStyle(this.displayElement).lineHeight);
      const visualLines = Math.max(1, Math.round(height / lineHeight));
      visualHeights.push(visualLines);
    });

    document.body.removeChild(measurer);
    return visualHeights;
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
    this.updateComparisonLineNumbers(lines);
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