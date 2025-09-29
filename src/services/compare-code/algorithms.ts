// ==========================================
// CORE COMPARISON ENGINE
// ==========================================

export type LineType = 'identical' | 'added' | 'removed' | 'modified' | 'empty';
export type TokenType = 'word' | 'whitespace' | 'punctuation' | 'operator' | 'number';
export type DiffOperationType = 'unchanged' | 'added' | 'removed' | 'modified';
export type LineOperationType = 'identical' | 'added' | 'removed' | 'modified';

export interface Token {
  text: string;
  type: TokenType;
  start: number;
  end: number;
}

export interface TokenOperation {
  type: DiffOperationType;
  token: Token;
  oldToken?: Token;
}

export interface ComparisonLine {
  content: string;
  type: LineType;
  htmlContent?: string; // Para contenido con highlighting inline
}

export interface ComparisonStats {
  added: number;
  removed: number;
  modified: number;
}

export interface LineOperation {
  type: LineOperationType;
  line1?: string;
  line2?: string;
}

export interface ComparisonResult {
  lines1: ComparisonLine[];
  lines2: ComparisonLine[];
  stats: ComparisonStats;
}

/**
 * Core comparison engine for analyzing differences between two text inputs
 */
export class ComparisonEngine {
  /**
   * Compare two text strings line by line with inline diff support
   * @param text1 First text to compare
   * @param text2 Second text to compare
   * @returns Comparison result with line-by-line differences and statistics
   */
  public static compare(text1: string, text2: string): ComparisonResult {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    // Use LCS to find the optimal alignment between lines
    const alignment = this.computeLineAlignment(lines1, lines2);
    
    const result1: ComparisonLine[] = [];
    const result2: ComparisonLine[] = [];
    const stats: ComparisonStats = { added: 0, removed: 0, modified: 0 };

    // Process the aligned lines
    for (const operation of alignment) {
      switch (operation.type) {
        case 'identical':
          result1.push({ content: operation.line1!, type: 'identical' });
          result2.push({ content: operation.line2!, type: 'identical' });
          break;
          
        case 'modified':
          // Generate inline diff highlighting for modified lines
          const inlineDiff1 = this.generateInlineDiff(operation.line1!, operation.line2!, 'left');
          const inlineDiff2 = this.generateInlineDiff(operation.line2!, operation.line1!, 'right');
          
          result1.push({ 
            content: operation.line1!, 
            type: 'modified',
            htmlContent: inlineDiff1
          });
          result2.push({ 
            content: operation.line2!, 
            type: 'modified',
            htmlContent: inlineDiff2
          });
          stats.modified++;
          break;
          
        case 'removed':
          result1.push({ content: operation.line1!, type: 'removed' });
          result2.push({ content: '', type: 'empty' });
          stats.removed++;
          break;
          
        case 'added':
          result1.push({ content: '', type: 'empty' });
          result2.push({ content: operation.line2!, type: 'added' });
          stats.added++;
          break;
      }
    }

    return { lines1: result1, lines2: result2, stats };
  }

  /**
   * Generate inline diff highlighting for modified lines
   * @param currentLine The line to highlight
   * @param otherLine The line to compare against
   * @param side Which side of the comparison ('left' or 'right')
   * @returns HTML string with highlighted differences
   */
  private static generateInlineDiff(currentLine: string, otherLine: string, side: 'left' | 'right'): string {
    const currentTokens = this.tokenizeLine(currentLine);
    const otherTokens = this.tokenizeLine(otherLine);
    
    const operations = this.computeTokenDifferences(currentTokens, otherTokens);
    
    return this.renderTokenOperations(operations, side);
  }

  /**
   * Tokenize a line into meaningful chunks for comparison
   * @param line The line to tokenize
   * @returns Array of tokens
   */
  private static tokenizeLine(line: string): Token[] {
    const tokens: Token[] = [];
    // Improved regex to better handle programming constructs
    const regex = /(\s+|\/\/.*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*'|`(?:[^`\\]|\\[\s\S])*`|\w+|\d+(?:\.\d+)?|[{}()\[\],.;:!?+\-*/=<>|&^%~@#$\\]|[^\s\w\d{}()\[\],.;:!?+\-*/=<>|&^%~@#$\\]+)/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      tokens.push({
        text: match[0],
        type: this.getTokenType(match[0]),
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return tokens;
  }

  /**
   * Determine the type of a token
   * @param text The token text
   * @returns The token type
   */
  private static getTokenType(text: string): TokenType {
    if (/^\s+$/.test(text)) { return 'whitespace'; }
    if (/^\d+(\.\d+)?$/.test(text)) { return 'number'; }
    if (/^[{}()\[\],.;:!?]$/.test(text)) { return 'punctuation'; }
    if (/^[+\-*/=<>|&^%~@#$\\]$/.test(text)) { return 'operator'; }
    if (/^["'`]/.test(text)) { return 'word'; } // String literals
    if (/^\/[/*]/.test(text)) { return 'word'; } // Comments
    return 'word';
  }

  /**
   * Compute differences between two token arrays using LCS algorithm
   * @param tokens1 First token array
   * @param tokens2 Second token array
   * @returns Array of token operations
   */
  private static computeTokenDifferences(tokens1: Token[], tokens2: Token[]): TokenOperation[] {
    const m = tokens1.length;
    const n = tokens2.length;
    
    // Create DP table for LCS computation
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Fill DP table - tokens are equal if their text and type match
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (tokens1[i - 1].text === tokens2[j - 1].text) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtrack to find the actual token operations
    const operations: TokenOperation[] = [];
    let i = m, j = n;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && tokens1[i - 1].text === tokens2[j - 1].text) {
        // Tokens are identical
        operations.unshift({ type: 'unchanged', token: tokens1[i - 1] });
        i--; j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
        // Token exists in left but not in right - removed
        operations.unshift({ type: 'removed', token: tokens1[i - 1] });
        i--;
      } else {
        // Token exists in right but not in left - added
        operations.unshift({ type: 'added', token: tokens2[j - 1] });
        j--;
      }
    }
    
    return operations;
  }



  /**
   * Render token operations as HTML
   * @param operations Array of token operations
   * @param side Which side of the comparison
   * @returns HTML string
   */
  private static renderTokenOperations(operations: TokenOperation[], side: 'left' | 'right'): string {
    return operations.map(op => {
      const escapedText = this.escapeHtml(op.token.text);
      
      switch (op.type) {
        case 'unchanged':
          return escapedText;
        case 'added':
          return side === 'right' ? `<span class="word-added">${escapedText}</span>` : '';
        case 'removed':
          return side === 'left' ? `<span class="word-removed">${escapedText}</span>` : '';
        case 'modified':
          return `<span class="word-modified">${escapedText}</span>`;
        default:
          return escapedText;
      }
    }).join('');
  }

  /**
   * Escape HTML characters
   * @param text Text to escape
   * @returns Escaped text
   */
  private static escapeHtml(text: string): string {
    if (!text) { return ''; }
    
    const escapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, (match) => escapeMap[match]);
  }

  /**
   * Validate if comparison is possible
   * @param text1 First text
   * @param text2 Second text
   * @returns True if at least one text has content
   */
  public static canCompare(text1: string, text2: string): boolean {
    return text1.trim().length > 0 || text2.trim().length > 0;
  }

  /**
   * Get total lines count for comparison result
   * @param result Comparison result
   * @returns Maximum line count between both sides
   */
  public static getTotalLines(result: ComparisonResult): number {
    return Math.max(result.lines1.length, result.lines2.length);
  }

  /**
   * Check if comparison has any differences
   * @param stats Comparison statistics
   * @returns True if there are any differences
   */
  public static hasDifferences(stats: ComparisonStats): boolean {
    return stats.added > 0 || stats.removed > 0 || stats.modified > 0;
  }

  /**
   * Compute line alignment using LCS algorithm to properly align similar lines
   * @param lines1 First set of lines
   * @param lines2 Second set of lines
   * @returns Array of line operations showing how lines align
   */
  private static computeLineAlignment(lines1: string[], lines2: string[]): LineOperation[] {
    const m = lines1.length;
    const n = lines2.length;
    
    // Create DP table for LCS computation
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Fill DP table - consider lines equal if they're identical
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (lines1[i - 1] === lines2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtrack to find the actual alignment
    const operations: LineOperation[] = [];
    let i = m, j = n;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
        // Lines are identical
        operations.unshift({
          type: 'identical',
          line1: lines1[i - 1],
          line2: lines2[j - 1]
        });
        i--; j--;
      } else if (i > 0 && j > 0 && dp[i - 1][j - 1] >= Math.max(dp[i - 1][j], dp[i][j - 1])) {
        // Lines are different but both exist - modified
        operations.unshift({
          type: 'modified',
          line1: lines1[i - 1],
          line2: lines2[j - 1]
        });
        i--; j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
        // Line exists in left but not in right - removed
        operations.unshift({
          type: 'removed',
          line1: lines1[i - 1]
        });
        i--;
      } else {
        // Line exists in right but not in left - added
        operations.unshift({
          type: 'added',
          line2: lines2[j - 1]
        });
        j--;
      }
    }
    
    return operations;
  }
}