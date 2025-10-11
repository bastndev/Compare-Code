// ======================================
// FILE SELECTOR DROPDOWN | MARK: DROPDOWN
// ======================================

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

interface FileItem {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
}

/**
 * File Selector Dropdown Manager
 */
export class FileDropdownManager {
  private dropdowns: Map<string, HTMLElement> = new Map();
  private currentFiles: FileItem[] = [];
  private filteredFiles: FileItem[] = [];

  constructor() {
    this.initializeDropdowns();
    this.setupMessageListener();
  }

  // ======================================
  // INITIALIZATION | MARK: INIT
  // ======================================

  private initializeDropdowns(): void {
    const fileSelectors = document.querySelectorAll('.file-selector');

    fileSelectors.forEach((selector) => {
      const side = selector.getAttribute('data-side') as string;
      const button = selector.querySelector(
        '.file-dropdown-btn'
      ) as HTMLElement;
      const menu = selector.querySelector('.file-dropdown-menu') as HTMLElement;
      const searchInput = selector.querySelector(
        '.file-search input'
      ) as HTMLInputElement;

      if (button && menu && side) {
        this.dropdowns.set(side, selector as HTMLElement);

        // Button click handler
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleDropdown(side);
        });

        // Search input handler
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            const query = (e.target as HTMLInputElement).value;
            this.filterFiles(query, side);
          });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (!selector.contains(e.target as Node)) {
            this.closeDropdown(side);
          }
        });
      }
    });
  }

  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'workspaceFiles':
          this.handleWorkspaceFiles(data.files, data.side);
          break;
        case 'fileContent':
          this.handleFileContent(data.content, data.side, data.fileName);
          break;
      }
    });
  }

  // ======================================
  // DROPDOWN CONTROL | MARK: CONTROL
  // ======================================

  private toggleDropdown(side: string): void {
    const dropdown = this.dropdowns.get(side);
    if (!dropdown) {
      return;
    }

    const menu = dropdown.querySelector('.file-dropdown-menu') as HTMLElement;

    if (menu.classList.contains('show')) {
      this.closeDropdown(side);
    } else {
      this.openDropdown(side);
    }
  }

  private openDropdown(side: string): void {
    // Close other dropdowns first
    this.closeAllDropdowns();

    const dropdown = this.dropdowns.get(side);
    if (!dropdown) {
      return;
    }

    const menu = dropdown.querySelector('.file-dropdown-menu') as HTMLElement;
    const button = dropdown.querySelector('.file-dropdown-btn') as HTMLElement;

    // Request files from VS Code
    this.requestWorkspaceFiles(side);

    // Show dropdown
    menu.classList.add('show');
    button.classList.add('open');

    // Focus search input
    const searchInput = dropdown.querySelector(
      '.file-search input'
    ) as HTMLInputElement;
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  private closeDropdown(side: string): void {
    const dropdown = this.dropdowns.get(side);
    if (!dropdown) {
      return;
    }

    const menu = dropdown.querySelector('.file-dropdown-menu') as HTMLElement;
    const button = dropdown.querySelector('.file-dropdown-btn') as HTMLElement;

    menu.classList.remove('show');
    button.classList.remove('open');

    // Clear search
    const searchInput = dropdown.querySelector(
      '.file-search input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }

  private closeAllDropdowns(): void {
    this.dropdowns.forEach((_, side) => {
      this.closeDropdown(side);
    });
  }

  // ======================================
  // FILE OPERATIONS | MARK: FILES
  // ======================================

  private requestWorkspaceFiles(side: string): void {
    vscode.postMessage({
      command: 'getWorkspaceFiles',
      side: side,
    });
  }

  private handleWorkspaceFiles(files: FileItem[], side: string): void {
    this.currentFiles = files;
    this.filteredFiles = [...files];
    this.renderFileList(side);
  }

  private filterFiles(query: string, side: string): void {
    if (!query.trim()) {
      this.filteredFiles = [...this.currentFiles];
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredFiles = this.currentFiles.filter(
        (file) =>
          file.name.toLowerCase().includes(lowerQuery) ||
          file.relativePath.toLowerCase().includes(lowerQuery)
      );
    }
    this.renderFileList(side);
  }

  private renderFileList(side: string): void {
    const dropdown = this.dropdowns.get(side);
    if (!dropdown) {
      return;
    }

    const fileList = dropdown.querySelector('.file-list') as HTMLElement;
    if (!fileList) {
      return;
    }

    if (this.filteredFiles.length === 0) {
      fileList.innerHTML = '<div class="no-files">No files found</div>';
      return;
    }

    const html = this.filteredFiles
      .map((file) => {
        const icon = this.getFileIcon(file);
        return `
        <div class="file-item" data-path="${file.path}" data-side="${side}">
          <span class="file-icon">${icon}</span>
          <span class="file-name">${file.name}</span>
          <span class="file-path">${this.truncatePath(file.relativePath)}</span>
        </div>
      `;
      })
      .join('');

    fileList.innerHTML = html;

    // Add click handlers
    fileList.querySelectorAll('.file-item').forEach((item) => {
      item.addEventListener('click', () => {
        const path = item.getAttribute('data-path');
        const itemSide = item.getAttribute('data-side');
        if (path && itemSide) {
          this.selectFile(path, itemSide);
        }
      });
    });
  }

  private selectFile(filePath: string, side: string): void {
    // Request file content from VS Code
    vscode.postMessage({
      command: 'loadFile',
      filePath: filePath,
      side: side,
    });

    this.closeDropdown(side);
  }

  private handleFileContent(
    content: string,
    side: string,
    fileName: string
  ): void {
    // Load content into the appropriate textarea
    const textareaId = side === 'left' ? 'codeInput1' : 'codeInput2';
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;

    if (textarea) {
      textarea.value = content;
      textarea.dispatchEvent(new Event('input')); // Trigger any listeners
    }

    // Update dropdown button text
    this.updateSelectedFile(side, fileName);
  }

  private updateSelectedFile(side: string, fileName: string): void {
    const dropdown = this.dropdowns.get(side);
    if (!dropdown) {
      return;
    }

    const selectedFileSpan = dropdown.querySelector(
      '.selected-file'
    ) as HTMLElement;
    if (selectedFileSpan) {
      selectedFileSpan.textContent = fileName;
      selectedFileSpan.title = fileName; // Tooltip for long names
    }
  }

  // ======================================
  // UTILITIES | MARK: UTILS
  // ======================================

  private getFileIcon(file: FileItem): string {
    if (file.type === 'directory') {
      return '📁';
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      js: '📄',
      ts: '📘',
      html: '🌐',
      css: '🎨',
      scss: '🎨',
      json: '📋',
      md: '📝',
      txt: '📄',
      py: '🐍',
      java: '☕',
      cpp: '⚙️',
      c: '⚙️',
      php: '🐘',
      rb: '💎',
      go: '�',
      rs: '🦀',
      vue: '💚',
      jsx: '⚛️',
      tsx: '⚛️',
    };

    return iconMap[ext || ''] || '📄';
  }

  private truncatePath(path: string, maxLength: number = 25): string {
    if (path.length <= maxLength) {
      return path;
    }
    return '...' + path.slice(-(maxLength - 3));
  }
}
