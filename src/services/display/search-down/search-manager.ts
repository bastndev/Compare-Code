// ======================================
// Search Manager | MARK: SEARCH MANAGER
// ======================================

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  extension?: string;
  icon?: string;
}

export class SearchManager {
  private leftInput: HTMLInputElement | null = null;
  private rightInput: HTMLInputElement | null = null;
  private leftSuggestions: HTMLElement | null = null;
  private rightSuggestions: HTMLElement | null = null;
  private searchTimeout: NodeJS.Timeout | null = null;
  private currentSearchTerm: string = '';

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
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    if (value.length > 0) {
      this.showSuggestions(side);
      this.currentSearchTerm = value;
      
      // Debounce search to avoid too many requests
      this.searchTimeout = setTimeout(() => {
        this.searchFiles(side, value);
      }, 300);
    } else {
      this.hideSuggestions(side);
      this.currentSearchTerm = '';
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

  private async searchFiles(side: 'left' | 'right', searchTerm: string): Promise<void> {
    const suggestions = side === 'left' ? this.leftSuggestions : this.rightSuggestions;
    
    if (!suggestions) {
      return;
    }

    console.log(`Searching for: "${searchTerm}" in ${side} panel`);

    // Show loading state
    this.showLoadingState(suggestions, searchTerm);

    try {
      // Request files from the extension
      const files = await this.requestFilesFromExtension(searchTerm);
      console.log(`Found ${files.length} files for "${searchTerm}":`, files);
      this.renderFileSuggestions(suggestions, files, side);
    } catch (error) {
      console.error('Error searching files:', error);
      this.showErrorState(suggestions, 'Error searching files');
    }
  }

  private showLoadingState(suggestions: HTMLElement, searchTerm: string): void {
    suggestions.innerHTML = `
      <div class="suggestion-item loading">
        <span class="file-icon">🔍</span>
        <span class="file-name">Searching for "${searchTerm}"...</span>
      </div>
    `;
  }

  private showErrorState(suggestions: HTMLElement, message: string): void {
    suggestions.innerHTML = `
      <div class="suggestion-item error">
        <span class="file-icon">⚠️</span>
        <span class="file-name">${message}</span>
      </div>
    `;
  }

  private renderFileSuggestions(suggestions: HTMLElement, files: FileItem[], side: 'left' | 'right'): void {
    if (files.length === 0) {
      suggestions.innerHTML = `
        <div class="suggestion-item no-results">
          <span class="file-icon">📄</span>
          <span class="file-name">No files found</span>
        </div>
      `;
      return;
    }

    const filesHtml = files.map(file => `
      <div class="suggestion-item" data-file-path="${file.path}" data-side="${side}">
        <span class="file-icon">${file.icon}</span>
        <span class="file-name">${file.name}</span>
        <span class="file-path">${file.path}</span>
      </div>
    `).join('');

    suggestions.innerHTML = filesHtml;

    // Add click event listeners to suggestion items
    this.attachSuggestionClickListeners(suggestions, side);
  }

  private attachSuggestionClickListeners(suggestions: HTMLElement, side: 'left' | 'right'): void {
    const items = suggestions.querySelectorAll('.suggestion-item[data-file-path]');
    
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const filePath = item.getAttribute('data-file-path');
        if (filePath) {
          this.selectFile(side, filePath);
        }
      });

      // Add hover effects
      item.addEventListener('mouseenter', () => {
        item.classList.add('hover');
      });

      item.addEventListener('mouseleave', () => {
        item.classList.remove('hover');
      });
    });
  }

  private selectFile(side: 'left' | 'right', filePath: string): void {
    // Hide suggestions immediately
    this.hideSuggestions(side);
    
    // Show loading state in the input
    const input = side === 'left' ? this.leftInput : this.rightInput;
    if (input) {
      input.value = `Loading ${filePath}...`;
    }
    
    // Notify the extension that a file was selected
    this.notifyFileSelected(side, filePath);
  }

  private async requestFilesFromExtension(searchTerm: string): Promise<FileItem[]> {
    return new Promise((resolve, reject) => {
      console.log('Requesting files from extension for:', searchTerm);
      
      // Check if VS Code API is available
      if (typeof window === 'undefined' || !(window as any).vscode) {
        console.error('VS Code API not available, using fallback data');
        // Fallback for testing
        setTimeout(() => {
          const fallbackFiles: FileItem[] = [
            { name: 'test.tsx', path: 'src/test.tsx', isDirectory: false, extension: '.tsx', icon: '🔷' },
            { name: 'test2.tsx', path: 'src/test2.tsx', isDirectory: false, extension: '.tsx', icon: '🔷' },
            { name: 'arrow-functio.tsx', path: 'src/arrow-functio.tsx', isDirectory: false, extension: '.tsx', icon: '🔷' },
            { name: 'paris.ts', path: 'src/paris.ts', isDirectory: false, extension: '.ts', icon: '🔷' },
          ].filter(file => 
            file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.path.toLowerCase().includes(searchTerm.toLowerCase())
          );
          resolve(fallbackFiles);
        }, 200);
        return;
      }

      // Set up message listener for this specific request
      const messageHandler = (event: MessageEvent) => {
        const message = event.data;
        console.log('Received message:', message);
        
        if (message.type === 'fileSearchResults') {
          window.removeEventListener('message', messageHandler);
          console.log('Received file search results:', message.files);
          resolve(message.files || []);
        } else if (message.type === 'fileSearchError') {
          window.removeEventListener('message', messageHandler);
          console.error('File search error:', message.error);
          reject(new Error(message.error || 'Search failed'));
        }
      };

      // Add temporary message listener
      window.addEventListener('message', messageHandler);

      // Request files from extension
      try {
        (window as any).vscode.postMessage({
          command: 'searchFiles',
          searchTerm: searchTerm,
          side: 'both'
        });
        console.log('Message sent to extension');
      } catch (error) {
        window.removeEventListener('message', messageHandler);
        console.error('Error sending message to extension:', error);
        reject(new Error('Failed to send message to extension'));
      }

      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        console.error('Search timeout after 5 seconds');
        reject(new Error('Search timeout'));
      }, 5000);
    });
  }

  private notifyFileSelected(side: 'left' | 'right', filePath: string): void {
    // Send message to extension
    if (typeof window !== 'undefined' && (window as any).vscode) {
      (window as any).vscode.postMessage({
        command: 'fileSelected',
        side: side,
        filePath: filePath
      });
    }
  }

  // ======================================
  // FILE CONTENT HANDLING | MARK: CONTENT
  // ======================================

  public initializeFileContentListener(): void {
    // Listen for file content loaded messages from extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      
      if (message.type === 'fileContentLoaded') {
        this.handleFileContentLoaded(message.side, message.filePath, message.content);
      } else if (message.type === 'fileLoadError') {
        this.handleFileLoadError(message.side, message.filePath, message.error);
      }
    });
  }

  private handleFileContentLoaded(side: 'left' | 'right', filePath: string, content: string): void {
    // Load content into the appropriate code editor
    const codeInput = side === 'left' ? 
      document.getElementById('codeInput1') as HTMLTextAreaElement :
      document.getElementById('codeInput2') as HTMLTextAreaElement;

    if (codeInput) {
      // Set the content
      codeInput.value = content;
      
      // Update the input field to show the selected file
      const searchInput = side === 'left' ? this.leftInput : this.rightInput;
      if (searchInput) {
        searchInput.value = filePath;
      }
      
      // Trigger input event to update any listeners
      const inputEvent = new Event('input', { bubbles: true });
      codeInput.dispatchEvent(inputEvent);
      
      // Trigger change event as well
      const changeEvent = new Event('change', { bubbles: true });
      codeInput.dispatchEvent(changeEvent);
      
      console.log(`File content loaded in ${side} panel:`, filePath);
    }

    // Show success message
    this.showFileLoadSuccess(side, filePath);
  }

  private handleFileLoadError(side: 'left' | 'right', filePath: string, error: string): void {
    console.error(`Failed to load file ${filePath}:`, error);
    
    // Reset the input field to show error
    const input = side === 'left' ? this.leftInput : this.rightInput;
    if (input) {
      input.value = `Error loading ${filePath}`;
    }
    
    // Show error message
    this.showFileLoadError(side, filePath, error);
  }

  private showFileLoadSuccess(side: 'left' | 'right', filePath: string): void {
    // You can implement a toast notification here
    console.log(`File loaded successfully: ${filePath} (${side} panel)`);
  }

  private showFileLoadError(side: 'left' | 'right', filePath: string, error: string): void {
    // You can implement a toast notification here
    console.error(`Failed to load file ${filePath} (${side} panel): ${error}`);
  }

  // ======================================
  // PUBLIC API | MARK: API
  // ======================================

  public initialize(): void {
    // Re-initialize if needed
    this.initializeElements();
    this.attachEventListeners();
    this.initializeFileContentListener();
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