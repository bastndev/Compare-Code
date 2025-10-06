// ======================================
// COMPARISON ENGINE | MARK: ENGINE
// ======================================

import {
  TokenType,
  LineOperationType,
  Token,
  TokenOperation,
  ComparisonLine,
  ComparisonStats,
  LineOperation,
  ComparisonResult,
  MovedLine,
  MoveCandidate,
} from '../../../utils/types';
import { AlgorithmSelector } from './algorithm-selector';

/**
 * Core comparison engine for analyzing differences between two text inputs
 * Uses LCS algorithm with intelligent movement detection
 */
export class ComparisonEngine {
  // ======================================
  // MAIN COMPARISON | MARK: COMPARE
  // ======================================

  /**
   * Compare two text strings with automatic algorithm selection
   */
  public static compare(text1: string, text2: string): ComparisonResult {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    let alignment = AlgorithmSelector.computeOptimalAlignment(lines1, lines2);

    // Detect and apply movement detection
    const movedLines = this.detectMovedLines(lines1, lines2, alignment);
    alignment = this.applyMoveDetection(alignment, movedLines);

    const result1: ComparisonLine[] = [];
    const result2: ComparisonLine[] = [];
    const stats: ComparisonStats = {
      added: 0,
      removed: 0,
      modified: 0,
    };

    let identicalCount = 0;
    let lineNumber1 = 1;
    let lineNumber2 = 1;

    for (const operation of alignment) {
      switch (operation.type) {
        case 'identical':
          result1.push({
            content: operation.line1!,
            type: 'identical',
            originalLineNumber: lineNumber1,
          });
          result2.push({
            content: operation.line2!,
            type: 'identical',
            originalLineNumber: lineNumber2,
          });
          identicalCount++;
          lineNumber1++;
          lineNumber2++;
          break;

        case 'modified':
          const inlineDiff1 = this.generateInlineDiff(
            operation.line1!,
            operation.line2!,
            'left'
          );
          const inlineDiff2 = this.generateInlineDiff(
            operation.line2!,
            operation.line1!,
            'right'
          );

          result1.push({
            content: operation.line1!,
            type: 'modified',
            htmlContent: inlineDiff1,
            originalLineNumber: lineNumber1,
          });
          result2.push({
            content: operation.line2!,
            type: 'modified',
            htmlContent: inlineDiff2,
            originalLineNumber: lineNumber2,
          });
          stats.modified++;
          lineNumber1++;
          lineNumber2++;
          break;

        case 'removed':
          result1.push({
            content: operation.line1!,
            type: 'removed',
            originalLineNumber: lineNumber1,
          });
          result2.push({
            content: '',
            type: 'empty',
            originalLineNumber: lineNumber2,
          });
          stats.removed++;
          lineNumber1++;
          break;

        case 'added':
          result1.push({
            content: '',
            type: 'empty',
            originalLineNumber: lineNumber1,
          });
          result2.push({
            content: operation.line2!,
            type: 'added',
            originalLineNumber: lineNumber2,
          });
          stats.added++;
          lineNumber2++;
          break;
      }
    }

    const totalLines = Math.max(result1.length, result2.length);

    // Calculate similarity
    let similarity: number;
    if (totalLines === 0) {
      similarity = 100;
    } else if (
      stats.added === 0 &&
      stats.removed === 0 &&
      stats.modified === 0
    ) {
      similarity = 100;
    } else {
      const effectiveChanges =
        stats.added + stats.removed + stats.modified;
      similarity = Math.round(
        Math.max(0, ((totalLines - effectiveChanges) / totalLines) * 100)
      );
    }

    return { lines1: result1, lines2: result2, stats, similarity, movedLines };
  }

  // ======================================
  // INLINE DIFF | MARK: DIFF
  // ======================================

  /**
   * Generate inline diff highlighting for modified lines
   */
  private static generateInlineDiff(
    currentLine: string,
    otherLine: string,
    side: 'left' | 'right'
  ): string {
    if (!currentLine && !otherLine) {
      return '';
    }
    if (!currentLine) {
      return side === 'right'
        ? `<span class="word-added">${this.escapeHtml(otherLine)}</span>`
        : '';
    }
    if (!otherLine) {
      return side === 'left'
        ? `<span class="word-removed">${this.escapeHtml(currentLine)}</span>`
        : '';
    }

    const currentTokens = this.tokenizeLine(currentLine);
    const otherTokens = this.tokenizeLine(otherLine);
    const operations = this.computeTokenDifferences(currentTokens, otherTokens);

    return this.renderTokensForSide(
      currentTokens,
      otherTokens,
      operations,
      side
    );
  }

  // ======================================
  // TOKENIZATION | MARK: TOKENS
  // ======================================

  /**
   * Tokenize a line into meaningful chunks for comparison
   */
  private static tokenizeLine(line: string): Token[] {
    const tokens: Token[] = [];
    const regex =
      /(\s+|\/\/.*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*'|`(?:[^`\\]|\\[\s\S])*`|\w+|\d+(?:\.\d+)?|[{}()\[\],.;:!?+\-*/=<>|&^%~@#$\\]|[^\s\w\d{}()\[\],.;:!?+\-*/=<>|&^%~@#$\\]+)/g;
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
   */
  private static getTokenType(text: string): TokenType {
    if (/^\s+$/.test(text)) {
      return 'whitespace';
    }
    if (/^\d+(\.\d+)?$/.test(text)) {
      return 'number';
    }
    if (/^[{}()\[\],.;:!?]$/.test(text)) {
      return 'punctuation';
    }
    if (/^[+\-*/=<>|&^%~@#$\\]$/.test(text)) {
      return 'operator';
    }
    if (/^["'`]/.test(text)) {
      return 'word';
    } // String literals
    if (/^\/[/*]/.test(text)) {
      return 'word';
    } // Comments
    return 'word';
  }

  /**
   * Compute token differences using LCS algorithm
   */
  private static computeTokenDifferences(
    tokens1: Token[],
    tokens2: Token[]
  ): TokenOperation[] {
    const m = tokens1.length;
    const n = tokens2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (tokens1[i - 1].text === tokens2[j - 1].text) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const operations: TokenOperation[] = [];
    let i = m,
      j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && tokens1[i - 1].text === tokens2[j - 1].text) {
        operations.unshift({ type: 'unchanged', token: tokens1[i - 1] });
        i--;
        j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
        operations.unshift({ type: 'removed', token: tokens1[i - 1] });
        i--;
      } else {
        operations.unshift({ type: 'added', token: tokens2[j - 1] });
        j--;
      }
    }

    return operations;
  }

  /**
   * Render tokens for specific side with highlighting
   */
  private static renderTokensForSide(
    currentTokens: Token[],
    otherTokens: Token[],
    operations: TokenOperation[],
    side: 'left' | 'right'
  ): string {
    const otherTokenTexts = new Set(otherTokens.map((t) => t.text));

    return currentTokens
      .map((token) => {
        const escapedText = this.escapeHtml(token.text);

        if (otherTokenTexts.has(token.text)) {
          return escapedText;
        } else {
          const className = side === 'left' ? 'word-removed' : 'word-added';
          return `<span class="${className}">${escapedText}</span>`;
        }
      })
      .join('');
  }

  // ======================================
  // UTILITIES | MARK: UTILS
  // ======================================

  /**
   * Escape HTML characters for safe rendering
   */
  private static escapeHtml(text: string): string {
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

  /**
   * Validate if comparison is possible
   */
  public static canCompare(text1: string, text2: string): boolean {
    return text1.trim().length > 0 || text2.trim().length > 0;
  }

  /**
   * Get total lines count for comparison result
   */
  public static getTotalLines(result: ComparisonResult): number {
    return Math.max(result.lines1.length, result.lines2.length);
  }

  /**
   * Check if comparison has any differences
   */
  public static hasDifferences(stats: ComparisonStats): boolean {
    return (
      stats.added > 0 ||
      stats.removed > 0 ||
      stats.modified > 0
    );
  }

  // ======================================
  // MOVEMENT DETECTION | MARK: MOVEMENT
  // ======================================

  /**
   * Detect lines that were moved rather than added/removed
   */
  private static detectMovedLines(
    lines1: string[],
    lines2: string[],
    operations: LineOperation[]
  ): MovedLine[] {
    const movedLines: MovedLine[] = [];
    const removedLines: { content: string; index: number }[] = [];
    const addedLines: { content: string; index: number }[] = [];

    // Collect removed and added lines
    operations.forEach((op, index) => {
      if (op.type === 'removed' && op.line1) {
        removedLines.push({ content: op.line1, index });
      } else if (op.type === 'added' && op.line2) {
        addedLines.push({ content: op.line2, index });
      }
    });

    // Find potential moves by matching content with 80% similarity threshold
    const usedRemoved = new Set<number>();
    const usedAdded = new Set<number>();

    removedLines.forEach((removed) => {
      if (usedRemoved.has(removed.index)) {
        return;
      }

      const bestMatch = this.findBestMoveMatch(
        removed.content,
        addedLines,
        usedAdded
      );

      if (bestMatch && bestMatch.similarity >= 0.8) {
        const moveId = `move_${movedLines.length}`;

        movedLines.push({
          content: removed.content,
          fromIndex: removed.index,
          toIndex: bestMatch.index,
          moveId,
          similarity: bestMatch.similarity,
        });

        usedRemoved.add(removed.index);
        usedAdded.add(bestMatch.index);
      }
    });

    return movedLines;
  }

  /**
   * Find the best matching line for a potential move
   */
  private static findBestMoveMatch(
    content: string,
    candidates: { content: string; index: number }[],
    usedIndices: Set<number>
  ): { index: number; similarity: number } | null {
    let bestMatch: { index: number; similarity: number } | null = null;

    candidates.forEach((candidate) => {
      if (usedIndices.has(candidate.index)) {
        return;
      }

      const similarity = this.calculateLineSimilarity(
        content,
        candidate.content
      );

      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { index: candidate.index, similarity };
      }
    });

    return bestMatch;
  }

  /**
   * Apply move detection to line operations
   */
  private static applyMoveDetection(
    operations: LineOperation[],
    movedLines: MovedLine[]
  ): LineOperation[] {
    const moveMap = new Map<number, MovedLine>();

    movedLines.forEach((move) => {
      moveMap.set(move.fromIndex, move);
      moveMap.set(move.toIndex, move);
    });

    return operations.map((op, index) => {
      const move = moveMap.get(index);
      if (move) {
        return {
          ...op,
          type: 'moved' as LineOperationType,
          moveId: move.moveId,
          originalIndex1: move.fromIndex,
          originalIndex2: move.toIndex,
        };
      }
      return op;
    });
  }

  // ======================================
  // LINE ALIGNMENT | MARK: ALIGNMENT
  // ======================================

  /**
   * Compute line alignment using LCS algorithm with similarity scoring
   */
  public static computeLineAlignment(
    lines1: string[],
    lines2: string[]
  ): LineOperation[] {
    const m = lines1.length;
    const n = lines2.length;

    // Handle edge cases
    if (m === 0 && n === 0) {
      return [];
    }
    if (m === 0) {
      return lines2.map((line) => ({
        type: 'added' as LineOperationType,
        line2: line,
      }));
    }
    if (n === 0) {
      return lines1.map((line) => ({
        type: 'removed' as LineOperationType,
        line1: line,
      }));
    }

    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));
    const similarity: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    // Pre-calculate similarity scores for all line pairs
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        similarity[i][j] = this.calculateLineSimilarity(
          lines1[i - 1],
          lines2[j - 1]
        );
      }
    }

    // Fill DP table with similarity-aware scoring
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (lines1[i - 1] === lines2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 2;
        } else if (similarity[i][j] > 0.7) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find optimal alignment
    const operations: LineOperation[] = [];
    let i = m,
      j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
        operations.unshift({
          type: 'identical',
          line1: lines1[i - 1],
          line2: lines2[j - 1],
        });
        i--;
        j--;
      } else if (
        i > 0 &&
        j > 0 &&
        similarity[i][j] > 0.3 &&
        dp[i - 1][j - 1] >= Math.max(dp[i - 1][j], dp[i][j - 1])
      ) {
        operations.unshift({
          type: 'modified',
          line1: lines1[i - 1],
          line2: lines2[j - 1],
        });
        i--;
        j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
        operations.unshift({ type: 'removed', line1: lines1[i - 1] });
        i--;
      } else {
        operations.unshift({ type: 'added', line2: lines2[j - 1] });
        j--;
      }
    }

    return operations;
  }

  /**
   * Calculate similarity score between two lines using Jaccard similarity
   */
  private static calculateLineSimilarity(line1: string, line2: string): number {
    if (line1 === line2) {
      return 1.0;
    }
    if (!line1 || !line2) {
      return 0.0;
    }

    const tokens1 = this.tokenizeLine(line1);
    const tokens2 = this.tokenizeLine(line2);

    if (tokens1.length === 0 && tokens2.length === 0) {
      return 1.0;
    }
    if (tokens1.length === 0 || tokens2.length === 0) {
      return 0.0;
    }

    const set1 = new Set(tokens1.map((t) => t.text));
    const set2 = new Set(tokens2.map((t) => t.text));
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }
}
