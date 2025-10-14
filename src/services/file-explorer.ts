// ======================================
// File Explorer Service | MARK: FILE EXPLORER
// ======================================

import * as vscode from 'vscode';
import * as path from 'path';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  extension?: string;
  icon?: string;
}

export class FileExplorerService {
  private workspaceRoot: string | undefined;

  constructor() {
    this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    console.log('FileExplorerService initialized with workspace root:', this.workspaceRoot);
  }

  // ======================================
  // FILE DISCOVERY | MARK: DISCOVERY
  // ======================================

  /**
   * Get all files in the workspace that match the search term
   */
  public async searchFiles(searchTerm: string, maxResults: number = 50): Promise<FileItem[]> {
    if (!searchTerm.trim()) {
      console.log('Empty search term');
      return [];
    }

    // Check if we have a workspace
    if (!this.workspaceRoot) {
      console.log('No workspace root found, checking for workspace folders...');
      const workspaceFolders = vscode.workspace.workspaceFolders;
      console.log('Workspace folders:', workspaceFolders);
      
      if (workspaceFolders && workspaceFolders.length > 0) {
        this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        console.log('Updated workspace root:', this.workspaceRoot);
      } else {
        console.log('No workspace folders available');
        return [];
      }
    }

    console.log(`Searching in workspace: ${this.workspaceRoot} for: "${searchTerm}"`);

    try {
      const files = await this.getFilesRecursively(this.workspaceRoot, searchTerm.toLowerCase(), maxResults);
      return files.sort((a, b) => {
        const searchLower = searchTerm.toLowerCase();
        const aNameLower = a.name.toLowerCase();
        const bNameLower = b.name.toLowerCase();
        
        // Priority 1: Files that start with the search term
        const aStartsWith = aNameLower.startsWith(searchLower);
        const bStartsWith = bNameLower.startsWith(searchLower);
        
        if (aStartsWith && !bStartsWith) {
          return -1;
        }
        if (!aStartsWith && bStartsWith) {
          return 1;
        }
        
        // Priority 2: Files that contain the search term
        const aContains = aNameLower.includes(searchLower);
        const bContains = bNameLower.includes(searchLower);
        
        if (aContains && !bContains) {
          return -1;
        }
        if (!aContains && bContains) {
          return 1;
        }
        
        // Priority 3: Files with shorter names (more specific matches)
        if (aContains && bContains) {
          return a.name.length - b.name.length;
        }
        
        // Default: alphabetical order
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  /**
   * Get file icon based on extension
   */
  private getFileIcon(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    const iconMap: { [key: string]: string } = {
      '.ts': '🔷', // TypeScript
      '.tsx': '🔷', // TypeScript React
      '.js': '🟨', // JavaScript
      '.jsx': '🟨', // JavaScript React
      '.html': '🌐', // HTML
      '.css': '🎨', // CSS
      '.scss': '🎨', // SCSS
      '.sass': '🎨', // SASS
      '.json': '📄', // JSON
      '.md': '📝', // Markdown
      '.txt': '📄', // Text
      '.xml': '📄', // XML
      '.yml': '⚙️', // YAML
      '.yaml': '⚙️', // YAML
      '.py': '🐍', // Python
      '.java': '☕', // Java
      '.cpp': '⚙️', // C++
      '.c': '⚙️', // C
      '.php': '🐘', // PHP
      '.rb': '💎', // Ruby
      '.go': '🐹', // Go
      '.rs': '🦀', // Rust
      '.vue': '💚', // Vue
      '.svelte': '🧡', // Svelte
      '.astro': '🌌', // Astro
      '.svg': '🖼️', // SVG
      '.png': '🖼️', // PNG
      '.jpg': '🖼️', // JPG
      '.jpeg': '🖼️', // JPEG
      '.gif': '🖼️', // GIF
      '.ico': '🖼️', // ICO
      '.pdf': '📕', // PDF
      '.zip': '📦', // ZIP
      '.tar': '📦', // TAR
      '.gz': '📦', // GZIP
      '.sql': '🗄️', // SQL
      '.sh': '🐚', // Shell
      '.bat': '🐚', // Batch
      '.ps1': '🐚', // PowerShell
      '.dockerfile': '🐳', // Docker
      '.gitignore': '🚫', // Git ignore
      '.env': '🔐', // Environment
      '.config': '⚙️', // Config
      '.lock': '🔒', // Lock file
    };

    return iconMap[ext] || '📄'; // Default file icon
  }

  /**
   * Recursively get files from directory
   */
  private async getFilesRecursively(
    dirPath: string, 
    searchTerm: string, 
    maxResults: number,
    currentResults: FileItem[] = []
  ): Promise<FileItem[]> {
    if (currentResults.length >= maxResults) {
      return currentResults;
    }

    try {
      console.log(`Reading directory: ${dirPath}`);
      const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dirPath));
      console.log(`Found ${entries.length} entries in ${dirPath}`);
      
      for (const [name, type] of entries) {
        if (currentResults.length >= maxResults) {
          break;
        }

        const fullPath = path.join(dirPath, name);
        const relativePath = path.relative(this.workspaceRoot!, fullPath);
        
        // Skip hidden files and common ignore patterns
        if (this.shouldIgnoreFile(name, relativePath)) {
          continue;
        }

        const isDirectory = type === vscode.FileType.Directory;
        
        // Check if file/directory name matches search term
        const nameLower = name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // More flexible matching: starts with, contains, or fuzzy match
        if (nameLower.startsWith(searchLower) || 
            nameLower.includes(searchLower) ||
            this.fuzzyMatch(nameLower, searchLower)) {
          
          const fileItem: FileItem = {
            name,
            path: relativePath,
            isDirectory,
            extension: isDirectory ? undefined : path.extname(name),
            icon: isDirectory ? '📁' : this.getFileIcon(name)
          };
          
          currentResults.push(fileItem);
          console.log(`Found matching file: ${name} (${relativePath})`);
        }

        // If it's a directory and we haven't reached max results, search recursively
        if (isDirectory && currentResults.length < maxResults) {
          await this.getFilesRecursively(fullPath, searchTerm, maxResults, currentResults);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }

    return currentResults;
  }

  /**
   * Simple fuzzy matching for better search results
   */
  private fuzzyMatch(text: string, pattern: string): boolean {
    if (pattern.length === 0) {
      return true;
    }
    if (pattern.length > text.length) {
      return false;
    }
    
    let patternIndex = 0;
    for (let i = 0; i < text.length && patternIndex < pattern.length; i++) {
      if (text[i] === pattern[patternIndex]) {
        patternIndex++;
      }
    }
    
    return patternIndex === pattern.length;
  }

  /**
   * Check if file should be ignored
   */
  private shouldIgnoreFile(fileName: string, relativePath: string): boolean {
    // Skip hidden files and directories
    if (fileName.startsWith('.')) {
      return true;
    }

    // Skip common build/cache directories
    const ignorePatterns = [
      'node_modules',
      'dist',
      'build',
      'out',
      '.git',
      '.vscode',
      'coverage',
      '.nyc_output',
      'tmp',
      'temp',
      '.cache',
      '.next',
      '.nuxt',
      '.vuepress',
      '.docusaurus'
    ];

    return ignorePatterns.some(pattern => 
      relativePath.includes(pattern) || fileName === pattern
    );
  }

  /**
   * Get file content for preview
   */
  public async getFileContent(filePath: string): Promise<string> {
    if (!this.workspaceRoot) {
      console.log('No workspace root found, checking for workspace folders...');
      const workspaceFolders = vscode.workspace.workspaceFolders;
      
      if (workspaceFolders && workspaceFolders.length > 0) {
        this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        console.log('Updated workspace root:', this.workspaceRoot);
      } else {
        throw new Error('No workspace root found');
      }
    }

    const fullPath = path.join(this.workspaceRoot, filePath);
    const uri = vscode.Uri.file(fullPath);
    
    console.log(`Reading file: ${fullPath}`);
    
    try {
      const content = await vscode.workspace.fs.readFile(uri);
      const textContent = Buffer.from(content).toString('utf8');
      console.log(`Successfully read file ${filePath}, content length: ${textContent.length}`);
      return textContent;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }
}
