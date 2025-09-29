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
  private currentLines1: ComparisonLine[] = [];
  private currentLines2: ComparisonLine[] = [];
  
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
    this.currentLines1 = lines1;
    this.currentLines2 = lines2;
    this.editor1.setCompareMode(lines1);
    this.editor2.setCompareMode(lines2);
  }

  public renderFiltered(filter: (line: ComparisonLine) => boolean): void {
    const filteredLines1 = this.currentLines1.filter(filter);
    const filteredLines2 = this.currentLines2.filter(filter);
    this.editor1.setCompareMode(filteredLines1);
    this.editor2.setCompareMode(filteredLines2);
  }

  public getCurrentLines(): { lines1: ComparisonLine[], lines2: ComparisonLine[] } {
    return { lines1: this.currentLines1, lines2: this.currentLines2 };
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
    const hasHtmlContent = lines.some(line => !!line.htmlContent);
    
    console.log(`🔢 Updating line numbers for editor ${this.editorId}`, {
      totalLines: lines.length,
      hasHtmlContent,
      displayElementWidth: this.displayElement.clientWidth,
      renderedElements: this.displayElement.querySelectorAll('.diff-line').length
    });
    
    // Calculate visual lines for comparison mode
    const visualHeights = this.calculateComparisonVisualLines(lines);
    
    // Validation: Check if any line needs multiple visual lines
    const multiLineCount = visualHeights.filter(h => h > 1).length;
    console.log(`📊 Visual heights:`, {
      heights: visualHeights,
      multiLineCount,
      maxHeight: Math.max(...visualHeights)
    });
    
    let numbersHTML = '';
    for (let i = 0; i < lines.length; i++) {
      const logicalLineNumber = i + 1;
      const visualLines = visualHeights[i];
      const className = this.getLineCssClass(lines[i].type);
      numbersHTML += this.createLineNumberElement(logicalLineNumber, visualLines, className);
    }
    
    this.lineNumbersElement.innerHTML = numbersHTML;
    
    console.log(`✅ Line numbers updated for editor ${this.editorId} - ${multiLineCount} multi-line entries`);
  }

  private calculateComparisonVisualLines(lines: ComparisonLine[]): number[] {
    const visualHeights: number[] = [];
    
    // HYBRID APPROACH: Try DOM measurement first, fallback to temporary element
    const diffLines = this.displayElement.querySelectorAll('.diff-line');
    
    if (diffLines.length === lines.length) {
      // PRIMARY: Use actual DOM elements if available
      return this.measureFromDOM(diffLines);
    } else {
      // FALLBACK: Use temporary element with HTML content measurement
      return this.measureWithTemporaryElement(lines);
    }
  }

  private measureFromDOM(diffLines: NodeListOf<Element>): number[] {
    const visualHeights: number[] = [];
    const displayStyles = window.getComputedStyle(this.displayElement);
    const baseLineHeight = parseFloat(displayStyles.lineHeight);
    
    console.log(`🎯 Using DOM measurement for ${diffLines.length} elements (editor ${this.editorId})`);
    
    diffLines.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const actualHeight = htmlElement.offsetHeight;
      const visualLines = Math.max(1, Math.round(actualHeight / baseLineHeight));
      
      if (index === 13 || visualLines > 1) {
        console.log(`Line ${index + 1} (DOM):`, {
          actualHeight,
          baseLineHeight,
          visualLines,
          hasSpans: htmlElement.innerHTML.includes('<span')
        });
      }
      
      visualHeights.push(visualLines);
    });
    
    return visualHeights;
  }

  private measureWithTemporaryElement(lines: ComparisonLine[]): number[] {
    const visualHeights: number[] = [];
    const measurer = document.createElement('div');
    const displayStyles = window.getComputedStyle(this.displayElement);
    
    // Copy exact styles from display element
    measurer.style.cssText = `
      position: absolute;
      visibility: hidden;
      top: -9999px;
      height: auto;
      width: ${this.displayElement.clientWidth - 15}px;
      font-family: ${displayStyles.fontFamily};
      font-size: ${displayStyles.fontSize};
      line-height: ${displayStyles.lineHeight};
      font-weight: ${displayStyles.fontWeight};
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      padding: ${displayStyles.padding};
      margin: 0;
      border: 0;
      box-sizing: border-box;
    `;
    
    // Copy CSS classes to include word highlighting styles
    measurer.className = this.displayElement.className;
    document.body.appendChild(measurer);

    const baseLineHeight = parseFloat(displayStyles.lineHeight);
    
    console.log(`🔄 Using temporary element measurement (editor ${this.editorId})`);
    
    lines.forEach((line, index) => {
      // CRITICAL: Use HTML content if available (for inline diff)
      if (line.htmlContent && line.htmlContent.trim()) {
        measurer.innerHTML = line.htmlContent;
      } else {
        measurer.textContent = line.content || ' ';
      }
      
      // Force layout recalculation
      measurer.offsetHeight;
      
      const actualHeight = measurer.offsetHeight;
      const visualLines = Math.max(1, Math.round(actualHeight / baseLineHeight));
      
      if (index === 13 || visualLines > 1) {
        console.log(`Line ${index + 1} (Temp):`, {
          actualHeight,
          baseLineHeight,
          visualLines,
          hasHtml: !!line.htmlContent
        });
      }
      
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
    let hasInlineContent = false;
    
    lines.forEach((line, index) => {
      const cssClass = this.getLineCssClass(line.type);
      
      // Preserve original content, using htmlContent only when available and valid
      let lineContent: string;
      if (line.htmlContent && line.htmlContent.trim()) {
        lineContent = line.htmlContent;
        hasInlineContent = true;
      } else if (line.type === 'empty') {
        // Show empty line indicator only for lines explicitly marked as empty by the algorithm
        lineContent = '<span class="empty-line-indicator">...</span><span class="empty-line-text">(empty line)</span>';
      } else {
        // For all other line types (removed, added, modified, identical), show the actual content
        lineContent = this.escapeHtml(line.content || '');
      }
      
      // Add debug logging for line 23 and other problematic cases
      if (index === 22 || index < 5 || line.content !== lineContent) {
        console.log(`🔍 Line ${index + 1} (${this.editorId}):`, {
          original: line.content,
          rendered: lineContent,
          type: line.type,
          hasHtml: !!line.htmlContent,
          isEmpty: !line.content || line.content.trim() === ''
        });
      }
      
      html += `<div class="diff-line ${cssClass}">${lineContent}</div>`;
    });

    this.displayElement.innerHTML = html;
    
    // HYBRID TIMING: Different timing based on content type
    if (hasInlineContent) {
      // For inline diff: Wait for proper rendering
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.updateComparisonLineNumbers(lines);
        });
      });
    } else {
      // For simple content: Immediate update
      requestAnimationFrame(() => {
        this.updateComparisonLineNumbers(lines);
      });
    }
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