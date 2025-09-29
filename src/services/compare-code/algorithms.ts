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
  htmlContent?: string;
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
    // Handle empty lines
    if (!currentLine && !otherLine) {
      return '';
    }
    if (!currentLine) {
      return side === 'right' ? `<span class="word-added">${this.escapeHtml(otherLine)}</span>` : '';
    }
    if (!otherLine) {
      return side === 'left' ? `<span class="word-removed">${this.escapeHtml(currentLine)}</span>` : '';
    }
    
    const currentTokens = this.tokenizeLine(currentLine);
    const otherTokens = this.tokenizeLine(otherLine);
    
    // Generate token differences preserving original content structure
    const operations = this.computeTokenDifferences(currentTokens, otherTokens);
    
    // Render tokens based on the current side and preserve original structure
    return this.renderTokensForSide(currentTokens, otherTokens, operations, side);
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
    const result: string[] = [];
    
    for (const op of operations) {
      const escapedText = this.escapeHtml(op.token.text);
      
      switch (op.type) {
        case 'unchanged':
          result.push(escapedText);
          break;
        case 'added':
          // Show added content only on the right side (where it was added)
          // On left side, show as empty to maintain structure
          if (side === 'right') {
            result.push(`<span class="word-added">${escapedText}</span>`);
          }
          break;
        case 'removed':
          // Show removed content only on the left side (where it was removed from)
          // On right side, show as empty to maintain structure
          if (side === 'left') {
            result.push(`<span class="word-removed">${escapedText}</span>`);
          }
          break;
        case 'modified':
          result.push(`<span class="word-modified">${escapedText}</span>`);
          break;
        default:
          result.push(escapedText);
          break;
      }
    }
    
    return result.join('');
  }

  /**
   * Render tokens for a specific side while preserving original content
   * @param currentTokens Tokens from current line
   * @param otherTokens Tokens from other line  
   * @param operations Token operations from diff
   * @param side Which side of comparison
   * @returns HTML string with proper highlighting
   */
  private static renderTokensForSide(
    currentTokens: Token[], 
    otherTokens: Token[], 
    operations: TokenOperation[], 
    side: 'left' | 'right'
  ): string {
    // Instead of using operations, render the actual tokens from the current side
    // and highlight differences based on what exists in the other side
    const otherTokenTexts = new Set(otherTokens.map(t => t.text));
    const currentTokenTexts = new Set(currentTokens.map(t => t.text));
    
    return currentTokens.map(token => {
      const escapedText = this.escapeHtml(token.text);
      
      if (otherTokenTexts.has(token.text)) {
        // Token exists in both sides - unchanged
        return escapedText;
      } else {
        // Token only exists in current side
        if (side === 'left') {
          // This token was removed from left
          return `<span class="word-removed">${escapedText}</span>`;
        } else {
          // This token was added to right
          return `<span class="word-added">${escapedText}</span>`;
        }
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
   * Compute line alignment using improved LCS algorithm to properly align similar lines
   * @param lines1 First set of lines
   * @param lines2 Second set of lines
   * @returns Array of line operations showing how lines align
   */
  private static computeLineAlignment(lines1: string[], lines2: string[]): LineOperation[] {
    const m = lines1.length;
    const n = lines2.length;
    
    // Handle empty cases
    if (m === 0 && n === 0) { return []; }
    if (m === 0) {
      return lines2.map(line => ({ type: 'added' as LineOperationType, line2: line }));
    }
    if (n === 0) {
      return lines1.map(line => ({ type: 'removed' as LineOperationType, line1: line }));
    }
    
    // Create DP table for LCS computation with similarity scoring
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    const similarity: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Pre-calculate similarity scores
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        similarity[i][j] = this.calculateLineSimilarity(lines1[i - 1], lines2[j - 1]);
      }
    }
    
    // Fill DP table - consider lines equal if they're identical or very similar
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (lines1[i - 1] === lines2[j - 1]) {
          // Identical lines get highest score
          dp[i][j] = dp[i - 1][j - 1] + 2;
        } else if (similarity[i][j] > 0.7) {
          // Similar lines get partial score
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
      } else if (i > 0 && j > 0 && similarity[i][j] > 0.3 && 
                 dp[i - 1][j - 1] >= Math.max(dp[i - 1][j], dp[i][j - 1])) {
        // Lines are similar enough to be considered modified
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

  /**
   * Calculate similarity score between two lines
   * @param line1 First line
   * @param line2 Second line
   * @returns Similarity score between 0 and 1
   */
  private static calculateLineSimilarity(line1: string, line2: string): number {
    if (line1 === line2) { return 1.0; }
    if (!line1 || !line2) { return 0.0; }
    
    const tokens1 = this.tokenizeLine(line1);
    const tokens2 = this.tokenizeLine(line2);
    
    if (tokens1.length === 0 && tokens2.length === 0) { return 1.0; }
    if (tokens1.length === 0 || tokens2.length === 0) { return 0.0; }
    
    // Count common tokens
    const set1 = new Set(tokens1.map(t => t.text));
    const set2 = new Set(tokens2.map(t => t.text));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    // Jaccard similarity
    return intersection.size / union.size;
  }
}