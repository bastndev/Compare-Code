// ======================================
// Search Manager | MARK: SEARCH MANAGER
// ======================================

export class SearchManager {
  private leftInput: HTMLInputElement | null = null;
  private rightInput: HTMLInputElement | null = null;
  private leftSuggestions: HTMLElement | null = null;
  private rightSuggestions: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
  }

  // ======================================
  // INITIALIZATION | MARK: INIT
  // ======================================
  
  private initializeElements(): void {
    this.leftInput = document.getElementById('search-input-left') as HTMLInputElement;
    this.rightInput = document.getElementById('search-input-right') as HTMLInputElement;
    this.leftSuggestions = document.getElementById('search-suggestions-left');
    this.rightSuggestions = document.getElementById('search-suggestions-right');
  }

  private attachEventListeners(): void {
    // Left panel input
    if (this.leftInput) {
      this.leftInput.addEventListener('input', (e) => {
        this.handleInputChange(e.target as HTMLInputElement, 'left');
      });

      this.leftInput.addEventListener('focus', (e) => {
        this.handleInputFocus(e.target as HTMLInputElement, 'left');
      });

      this.leftInput.addEventListener('blur', (e) => {
        // Delay hiding to allow clicking on suggestions
        setTimeout(() => {
          this.hideSuggestions('left');
        }, 150);
      });
    }

    // Right panel input
    if (this.rightInput) {
      this.rightInput.addEventListener('input', (e) => {
        this.handleInputChange(e.target as HTMLInputElement, 'right');
      });

      this.rightInput.addEventListener('focus', (e) => {
        this.handleInputFocus(e.target as HTMLInputElement, 'right');
      });

      this.rightInput.addEventListener('blur', (e) => {
        // Delay hiding to allow clicking on suggestions
        setTimeout(() => {
          this.hideSuggestions('right');
        }, 150);
      });
    }
  }

  // ======================================
  // EVENT HANDLERS | MARK: HANDLERS
  // ======================================

  private handleInputChange(input: HTMLInputElement, side: 'left' | 'right'): void {
    const value = input.value.trim();
    
    if (value.length > 0) {
      this.showSuggestions(side);
      // TODO: Aquí se implementará la búsqueda de archivos
      this.updateSuggestions(side, value);
    } else {
      this.hideSuggestions(side);
    }
  }

  private handleInputFocus(input: HTMLInputElement, side: 'left' | 'right'): void {
    const value = input.value.trim();
    
    if (value.length > 0) {
      this.showSuggestions(side);
    }
  }

  // ======================================
  // SUGGESTIONS DISPLAY | MARK: DISPLAY
  // ======================================

  private showSuggestions(side: 'left' | 'right'): void {
    const suggestions = side === 'left' ? this.leftSuggestions : this.rightSuggestions;
    
    if (suggestions) {
      suggestions.style.display = 'block';
    }
  }

  private hideSuggestions(side: 'left' | 'right'): void {
    const suggestions = side === 'left' ? this.leftSuggestions : this.rightSuggestions;
    
    if (suggestions) {
      suggestions.style.display = 'none';
    }
  }

  private updateSuggestions(side: 'left' | 'right', searchTerm: string): void {
    const suggestions = side === 'left' ? this.leftSuggestions : this.rightSuggestions;
    
    if (!suggestions) {
        return;
    }

    // Por ahora, mostrar un mensaje simple
    suggestions.innerHTML = `
      <div style="padding: 10px; color: #cccccc; font-size: 12px;">
        Searching for: "${searchTerm}"...
      </div>
    `;
  }

  // ======================================
  // PUBLIC API | MARK: API
  // ======================================

  public initialize(): void {
    // Re-initialize if needed
    this.initializeElements();
    this.attachEventListeners();
  }
}

// ======================================
// GLOBAL INITIALIZATION | MARK: GLOBAL
// ======================================

let searchManagerInstance: SearchManager | null = null;

export function initializeSearchManager(): void {
  if (!searchManagerInstance) {
    searchManagerInstance = new SearchManager();
  }
}

export function getSearchManager(): SearchManager | null {
  return searchManagerInstance;
}