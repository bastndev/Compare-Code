import { ComparisonLine, LineType } from '../../utils/types';

// ======================================
// EDITOR MANAGEMENT | MARK: MANAGER
// ======================================

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
    return editorId === '1'
      ? this.editor1.getContent()
      : this.editor2.getContent();
  }

  public setEditMode(): void {
    this.editor1.setEditMode();
    this.editor2.setEditMode();
  }

  public setCompareMode(
    lines1: ComparisonLine[],
    lines2: ComparisonLine[]
  ): void {
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

  public getCurrentLines(): {
    lines1: ComparisonLine[];
    lines2: ComparisonLine[];
  } {
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

// ======================================
// EDITOR INSTANCE | MARK: INSTANCE
// ======================================

/**
 * Manages individual editor instance UI behavior
 */
export class EditorInstance {
  private editorId: string;
  private textareaElement: HTMLTextAreaElement;
  private displayElement: HTMLElement;
  private lineNumbersElement: HTMLElement;
  private unifiedEditor: HTMLElement;
  private savedScrollPosition: number = 0;

  constructor(id: string) {
    this.editorId = id;
    this.textareaElement = document.getElementById(
      `codeInput${id}`
    ) as HTMLTextAreaElement;
    this.displayElement = document.getElementById(
      `codeDisplay${id}`
    ) as HTMLElement;
    this.lineNumbersElement = document.getElementById(
      `lineNumbers${id}`
    ) as HTMLElement;
    this.unifiedEditor = document.getElementById(`editor${id}`) as HTMLElement;

    if (
      !this.textareaElement ||
      !this.displayElement ||
      !this.lineNumbersElement ||
      !this.unifiedEditor
    ) {
      throw new Error(`Editor elements not found for editor ${id}`);
    }

    this.initializeEditor();
  }

  // ======================================
  // INITIALIZATION | MARK: INIT
  // ======================================

  private initializeEditor(): void {
    this.updateLineNumbers();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    this.textareaElement.addEventListener('input', () =>
      this.updateLineNumbers()
    );
    this.textareaElement.addEventListener('scroll', () =>
      this.syncEditScroll()
    );
    this.textareaElement.addEventListener('keydown', (e) =>
      this.handleKeyDown(e)
    );
    this.textareaElement.addEventListener('keyup', () =>
      this.updateCurrentLineHighlight()
    );
    this.textareaElement.addEventListener('click', () =>
      this.updateCurrentLineHighlight()
    );
    this.textareaElement.addEventListener('selectionchange', () =>
      this.updateCurrentLineHighlight()
    );
    window.addEventListener('resize', () => this.updateLineNumbers());
    
    // Add line number click functionality
    this.lineNumbersElement.addEventListener('click', (e) =>
      this.handleLineNumberClick(e)
    );
    
    // Add hover isolation - disable hover effects on opposite panel
    const codePanelElement = document.getElementById(`panel${this.editorId}`);
    if (codePanelElement) {
      codePanelElement.addEventListener('mouseenter', () => {
        this.enableHoverForThisPanel();
      });
      
      codePanelElement.addEventListener('mouseleave', () => {
        this.disableHoverForThisPanel();
        // Clear current line highlight when mouse leaves the entire panel
        this.clearAllCurrentLineHighlights();
      });
    }
    
    // Add hover tracking on line numbers to manage current-line highlight
    this.lineNumbersElement.addEventListener('mouseover', (e) => {
      this.handleLineNumberHover(e);
    });
    
    this.lineNumbersElement.addEventListener('mouseout', (e) => {
      this.handleLineNumberMouseOut(e);
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      e.preventDefault();
      this.insertTab();
    }
  }

  private handleLineNumberClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains('line-number-item')) {
      const lineNumber = parseInt(target.textContent || '1');
      this.selectLineInTextarea(lineNumber);
    }
  }

  private selectLineInTextarea(lineNumber: number): void {
    const content = this.textareaElement.value;
    const lines = content.split('\n');
    
    if (lineNumber < 1 || lineNumber > lines.length) {
      return;
    }
    
    // Calculate the start and end positions for the line
    let startPos = 0;
    for (let i = 0; i < lineNumber - 1; i++) {
      startPos += lines[i].length + 1; // +1 for the newline character
    }
    
    const endPos = startPos + lines[lineNumber - 1].length;
    
    // Set the selection
    this.textareaElement.focus();
    this.textareaElement.setSelectionRange(startPos, endPos);
    
    // Scroll to the selected line
    this.scrollToLine(lineNumber);
  }

  private scrollToLine(lineNumber: number): void {
    const content = this.textareaElement.value;
    const lines = content.split('\n');
    
    if (lineNumber < 1 || lineNumber > lines.length) {
      return;
    }
    
    // Calculate approximate scroll position
    const lineHeight = parseFloat(window.getComputedStyle(this.textareaElement).lineHeight);
    const scrollTop = (lineNumber - 1) * lineHeight;
    
    this.textareaElement.scrollTop = scrollTop;
    this.lineNumbersElement.scrollTop = scrollTop;
  }

  private updateCurrentLineHighlight(): void {
    // Only update in edit mode
    if (this.unifiedEditor.classList.contains('mode-compare')) {
      return;
    }

    const cursorPosition = this.textareaElement.selectionStart;
    const content = this.textareaElement.value;
    const lines = content.split('\n');
    
    let currentLine = 1;
    let charCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (cursorPosition <= charCount + lines[i].length) {
        currentLine = i + 1;
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline
    }
    
    // Remove current-line class from all line numbers
    const lineNumberItems = this.lineNumbersElement.querySelectorAll('.line-number-item');
    lineNumberItems.forEach(item => {
      item.classList.remove('current-line');
    });
    
    // Add current-line class to the current line number
    if (currentLine <= lineNumberItems.length) {
      lineNumberItems[currentLine - 1]?.classList.add('current-line');
    }
  }

  // ======================================
  // HOVER ISOLATION | MARK: HOVER
  // ======================================

  private enableHoverForThisPanel(): void {
    const otherPanelId = this.editorId === '1' ? '2' : '1';
    const otherPanel = document.getElementById(`panel${otherPanelId}`);
    
    if (otherPanel) {
      otherPanel.classList.add('hover-disabled');
      // Clear current-line highlight from the other panel
      this.clearCurrentLineHighlightFromPanel(otherPanelId);
    }
  }

  private disableHoverForThisPanel(): void {
    const otherPanelId = this.editorId === '1' ? '2' : '1';
    const otherPanel = document.getElementById(`panel${otherPanelId}`);
    
    if (otherPanel) {
      otherPanel.classList.remove('hover-disabled');
    }
  }

  private clearCurrentLineHighlightFromPanel(panelId: string): void {
    const lineNumbers = document.getElementById(`lineNumbers${panelId}`);
    if (lineNumbers) {
      const lineNumberItems = lineNumbers.querySelectorAll('.line-number-item');
      lineNumberItems.forEach(item => {
        item.classList.remove('current-line');
      });
    }
  }

  private clearAllCurrentLineHighlights(): void {
    const lineNumberItems = this.lineNumbersElement.querySelectorAll('.line-number-item');
    lineNumberItems.forEach(item => {
      item.classList.remove('current-line');
    });
  }

  private handleLineNumberHover(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    
    // Only apply hover effect in compare mode
    if (!this.unifiedEditor.classList.contains('mode-compare')) {
      return;
    }
    
    if (target.classList.contains('line-number-item')) {
      // Clear all current-line highlights first
      this.clearAllCurrentLineHighlights();
      // Add current-line to the hovered element
      target.classList.add('current-line');
    }
  }

  private handleLineNumberMouseOut(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    
    // Only in compare mode
    if (!this.unifiedEditor.classList.contains('mode-compare')) {
      return;
    }
    
    if (target.classList.contains('line-number-item')) {
      target.classList.remove('current-line');
    }
  }

  // ======================================
  // TEXT EDITING | MARK: EDITING
  // ======================================

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
    this.lineNumbersElement.innerHTML = '';
  }

  // ======================================
  // LINE NUMBERS | MARK: NUMBERS
  // ======================================

  public updateLineNumbers(): void {
    if (this.unifiedEditor.classList.contains('mode-compare')) {
      return;
    }

    const content = this.textareaElement.value;
    const logicalLines = content.split('\n');
    
    // Always show at least line number 1, even for empty content
    if (content.trim() === '') {
      this.lineNumbersElement.innerHTML = '<div class="line-number-item" style="height: 1.4em; line-height: 1.4em; padding-top: 0em;">1</div>';
      return;
    }
    
    const lineCount = logicalLines.length;
    const visualLineHeights = this.calculateVisualLines(
      logicalLines,
      this.textareaElement
    );

    let numbersHTML = '';
    for (let i = 0; i < lineCount; i++) {
      const logicalLineNumber = i + 1;
      const visualHeight = visualLineHeights[i];
      numbersHTML += this.createLineNumberElement(
        logicalLineNumber,
        visualHeight
      );
    }

    this.lineNumbersElement.innerHTML = numbersHTML;
    
    // Update current line highlight after updating line numbers
    this.updateCurrentLineHighlight();
  }

  private calculateVisualLines(
    logicalLines: string[],
    container: HTMLElement
  ): number[] {
    const visualHeights: number[] = [];
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

    logicalLines.forEach((line) => {
      measurer.textContent = line || ' ';
      const height = measurer.offsetHeight;
      const lineHeight = parseFloat(
        window.getComputedStyle(container).lineHeight
      );
      const visualLines = Math.max(1, Math.round(height / lineHeight));
      visualHeights.push(visualLines);
    });

    document.body.removeChild(measurer);
    return visualHeights;
  }

  private createLineNumberElement(
    lineNumber: number | string,
    visualLines: number,
    className?: string
  ): string {
    const lineHeight = 1.4;
    const totalHeight = visualLines * lineHeight;
    const centerOffset = visualLines > 1 ? (totalHeight - lineHeight) / 2 : 0;
    const classAttr = className
      ? ` class="line-number-item ${className}"`
      : ' class="line-number-item"';

    return `<div${classAttr} style="height: ${totalHeight}em; line-height: ${lineHeight}em; padding-top: ${centerOffset}em;">${lineNumber}</div>`;
  }

  private updateComparisonLineNumbers(lines: ComparisonLine[]): void {
    const visualHeights = this.calculateComparisonVisualLines(lines);

    let numbersHTML = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const visualLines = visualHeights[i];
      const className = this.getLineCssClass(line.type);
      
      // ADD here point . or void 
      let displayNumber: string;
      if (line.type === 'empty' || (line.content && line.content.trim() === '')) {
        displayNumber = '.';
      } else {
        displayNumber = (line.originalLineNumber || i + 1).toString();
      }
      
      numbersHTML += this.createLineNumberElement(
        displayNumber,
        visualLines,
        className
      );
    }

    this.lineNumbersElement.innerHTML = numbersHTML;
  }

  private calculateComparisonVisualLines(lines: ComparisonLine[]): number[] {
    const diffLines = this.displayElement.querySelectorAll('.diff-line');

    if (diffLines.length === lines.length) {
      return this.measureFromDOM(diffLines);
    } else {
      return this.measureWithTemporaryElement(lines);
    }
  }

  private measureFromDOM(diffLines: NodeListOf<Element>): number[] {
    const visualHeights: number[] = [];
    const displayStyles = window.getComputedStyle(this.displayElement);
    const baseLineHeight = parseFloat(displayStyles.lineHeight);

    diffLines.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const actualHeight = htmlElement.offsetHeight;
      const visualLines = Math.max(
        1,
        Math.round(actualHeight / baseLineHeight)
      );
      visualHeights.push(visualLines);
    });

    return visualHeights;
  }

  private measureWithTemporaryElement(lines: ComparisonLine[]): number[] {
    const visualHeights: number[] = [];
    const measurer = document.createElement('div');
    const displayStyles = window.getComputedStyle(this.displayElement);

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

    measurer.className = this.displayElement.className;
    document.body.appendChild(measurer);

    const baseLineHeight = parseFloat(displayStyles.lineHeight);

    lines.forEach((line) => {
      if (line.htmlContent && line.htmlContent.trim()) {
        measurer.innerHTML = line.htmlContent;
      } else {
        measurer.textContent = line.content || ' ';
      }

      measurer.offsetHeight; // Force layout recalculation
      const actualHeight = measurer.offsetHeight;
      const visualLines = Math.max(
        1,
        Math.round(actualHeight / baseLineHeight)
      );
      visualHeights.push(visualLines);
    });

    document.body.removeChild(measurer);
    return visualHeights;
  }

  // ======================================
  // SCROLL SYNC | MARK: SCROLL
  // ======================================

  private syncEditScroll(): void {
    this.lineNumbersElement.scrollTop = this.textareaElement.scrollTop;
  }

  private syncCompareScroll(): void {
    this.displayElement.addEventListener('scroll', () => {
      this.lineNumbersElement.scrollTop = this.displayElement.scrollTop;
    });
  }

  // ======================================
  // MODE SWITCHING | MARK: MODES
  // ======================================

  public setEditMode(): void {
    this.unifiedEditor.classList.remove('mode-compare');
    this.unifiedEditor.classList.add('mode-edit');
    this.updateLineNumbers();
    
    // Restore saved scroll position when returning to edit mode
    requestAnimationFrame(() => {
      this.textareaElement.scrollTop = this.savedScrollPosition;
      this.lineNumbersElement.scrollTop = this.savedScrollPosition;
      // Update current line highlight after restoring scroll position
      this.updateCurrentLineHighlight();
    });
  }

  public setCompareMode(lines: ComparisonLine[]): void {
    // Save current scroll position before switching to compare mode
    this.savedScrollPosition = this.textareaElement.scrollTop;
    
    this.unifiedEditor.classList.remove('mode-edit');
    this.unifiedEditor.classList.add('mode-compare');
    this.renderComparison(lines);
    this.syncCompareScroll();
    
    // Fix: Force immediate line numbers sync when switching to compare mode
    requestAnimationFrame(() => {
      this.displayElement.scrollTop = 0; // Reset scroll to top
      this.lineNumbersElement.scrollTop = 0; // Sync line numbers immediately
    });
  }

  // ======================================
  // COMPARISON RENDERING | MARK: RENDER
  // ======================================

  private renderComparison(lines: ComparisonLine[]): void {
    let html = '';
    let hasInlineContent = false;

    // Detect large files and apply appropriate class
    const isLargeFile = lines.length > 50;
    if (isLargeFile) {
      this.displayElement.classList.add('large-file');
    } else {
      this.displayElement.classList.remove('large-file');
    }

    lines.forEach((line) => {
      const cssClass = this.getLineCssClass(line.type);
      let lineContent: string;

      if (line.htmlContent && line.htmlContent.trim()) {
        lineContent = line.htmlContent;
        hasInlineContent = true;
      } else if (line.type === 'empty') {
        lineContent =
          '<span class="empty-line-indicator">...</span><span class="empty-line-text">(empty line)</span>';
      } else {
        lineContent = this.escapeHtml(line.content || '');
      }

      html += `<div class="diff-line ${cssClass}">${lineContent}</div>`;
    });

    this.displayElement.innerHTML = html;

    if (hasInlineContent) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.updateComparisonLineNumbers(lines);
          // Ensure line numbers are synced after update
          this.lineNumbersElement.scrollTop = this.displayElement.scrollTop;
        });
      });
    } else {
      requestAnimationFrame(() => {
        this.updateComparisonLineNumbers(lines);
        // Ensure line numbers are synced after update
        this.lineNumbersElement.scrollTop = this.displayElement.scrollTop;
      });
    }
  }

  // ======================================
  // UTILITIES | MARK: UTILS
  // ======================================

  private getLineCssClass(type: LineType): string {
    switch (type) {
      case 'added':
        return 'added';
      case 'removed':
        return 'removed';
      case 'modified':
        return 'modified';
      case 'empty':
        return 'empty';
      default:
        return 'identical';
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
      "'": '&#039;',
    };

    return text.replace(/[&<>"']/g, (match) => escapeMap[match]);
  }
}