// ======================================
// MYERS DIFF ALGORITHM | MARK: MYERS
// ======================================

import { LineOperation, LineOperationType } from '../../../utils/types';

/**
 * Myers diff algorithm implementation
 * Based on "An O(ND) Difference Algorithm and Its Variations" by Eugene Myers
 * Optimized for large files and better performance than LCS
 */
export class MyersAlgorithm {
  // ======================================
  // MAIN MYERS ALGORITHM | MARK: MAIN
  // ======================================

  /**
   * Compute line alignment using Myers algorithm
   * Time complexity: O((M+N)*D) where D is the number of differences
   * Space complexity: O(M+N)
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

    // Run Myers algorithm to get edit script
    const edits = this.myersDiff(lines1, lines2);
    
    // Convert edit script to LineOperation format
    return this.buildOperationsFromEdits(edits, lines1, lines2);
  }

  // ======================================
  // CORE MYERS IMPLEMENTATION | MARK: CORE
  // ======================================

  /**
   * Core Myers diff algorithm
   * Returns an edit script representing the shortest edit sequence
   */
  private static myersDiff(lines1: string[], lines2: string[]): DiffEdit[] {
    const m = lines1.length;
    const n = lines2.length;
    const max = m + n;

    // V array stores the furthest reaching D-path in diagonal k
    const v: number[] = new Array(2 * max + 1);
    v[max + 1] = 0;

    // Store the trace for backtracking
    const trace: number[][] = [];

    // Forward search - find the shortest edit script
    for (let d = 0; d <= max; d++) {
      // Save current state for backtracking
      trace.push([...v]);

      for (let k = -d; k <= d; k += 2) {
        const kIndex = k + max;
        let x: number;

        // Determine if we came from diagonal k-1 (insertion) or k+1 (deletion)
        if (k === -d || (k !== d && v[kIndex - 1] < v[kIndex + 1])) {
          // Came from k+1 (deletion from lines1)
          x = v[kIndex + 1];
        } else {
          // Came from k-1 (insertion to lines2)
          x = v[kIndex - 1] + 1;
        }

        let y = x - k;

        // Extend diagonal as far as possible (matching lines)
        while (x < m && y < n && lines1[x] === lines2[y]) {
          x++;
          y++;
        }

        v[kIndex] = x;

        // Check if we've reached the end
        if (x >= m && y >= n) {
          return this.buildEditScriptFromTrace(trace, lines1, lines2, d);
        }
      }
    }

    // This should never happen for valid inputs
    return [];
  }

  /**
   * Build edit script by backtracking through the trace
   */
  private static buildEditScriptFromTrace(
    trace: number[][],
    lines1: string[],
    lines2: string[],
    d: number
  ): DiffEdit[] {
    const edits: DiffEdit[] = [];
    let x = lines1.length;
    let y = lines2.length;
    const max = lines1.length + lines2.length;

    // Backtrack through the trace to build edit script
    for (let depth = d; depth > 0; depth--) {
      const v = trace[depth - 1];
      const k = x - y;
      const kIndex = k + max;

      let prevK: number;
      if (k === -depth || (k !== depth && v[kIndex - 1] < v[kIndex + 1])) {
        prevK = k + 1;
      } else {
        prevK = k - 1;
      }

      const prevX = v[prevK + max];
      const prevY = prevX - prevK;

      // Add diagonal moves (identical lines) - process in reverse
      while (x > prevX && y > prevY) {
        x--;
        y--;
        edits.unshift({
          type: 'equal',
          oldIndex: x,
          newIndex: y,
          oldLine: lines1[x],
          newLine: lines2[y],
        });
      }

      // Add the edit operation
      if (x > prevX) {
        // Deletion
        x--;
        edits.unshift({
          type: 'delete',
          oldIndex: x,
          newIndex: y,
          oldLine: lines1[x],
          newLine: undefined,
        });
      } else if (y > prevY) {
        // Insertion
        y--;
        edits.unshift({
          type: 'insert',
          oldIndex: x,
          newIndex: y,
          oldLine: undefined,
          newLine: lines2[y],
        });
      }
    }

    // Add remaining diagonal moves at the beginning
    while (x > 0 && y > 0) {
      x--;
      y--;
      edits.unshift({
        type: 'equal',
        oldIndex: x,
        newIndex: y,
        oldLine: lines1[x],
        newLine: lines2[y],
      });
    }

    return edits;
  }

  // ======================================
  // CONVERSION TO LINE OPERATIONS | MARK: CONVERT
  // ======================================

  /**
   * Convert Myers edit script to LineOperation format
   * This maintains compatibility with the existing codebase
   */
  private static buildOperationsFromEdits(
    edits: DiffEdit[],
    lines1: string[],
    lines2: string[]
  ): LineOperation[] {
    const operations: LineOperation[] = [];

    for (const edit of edits) {
      switch (edit.type) {
        case 'equal':
          operations.push({
            type: 'identical',
            line1: edit.oldLine!,
            line2: edit.newLine!,
          });
          break;

        case 'delete':
          operations.push({
            type: 'removed',
            line1: edit.oldLine!,
          });
          break;

        case 'insert':
          operations.push({
            type: 'added',
            line2: edit.newLine!,
          });
          break;
      }
    }

    // Post-process to detect modified lines
    return this.detectModifiedLines(operations);
  }

  /**
   * Detect modified lines by looking for adjacent delete/insert pairs
   * This improves the quality of the diff by showing modifications instead of separate add/remove
   */
  private static detectModifiedLines(operations: LineOperation[]): LineOperation[] {
    const result: LineOperation[] = [];
    let i = 0;

    while (i < operations.length) {
      const current = operations[i];
      const next = operations[i + 1];

      // Check for delete followed by insert (potential modification)
      if (
        current &&
        next &&
        current.type === 'removed' &&
        next.type === 'added' &&
        current.line1 &&
        next.line2
      ) {
        // Calculate similarity to determine if it's a modification
        const similarity = this.calculateLineSimilarity(current.line1, next.line2);
        
        if (similarity > 0.3) {
          // Treat as modification
          result.push({
            type: 'modified',
            line1: current.line1,
            line2: next.line2,
          });
          i += 2; // Skip both operations
        } else {
          // Keep as separate delete and insert
          result.push(current);
          i++;
        }
      } else {
        result.push(current);
        i++;
      }
    }

    return result;
  }

  // ======================================
  // UTILITIES | MARK: UTILS
  // ======================================

  /**
   * Calculate similarity between two lines using a simple token-based approach
   * This is a simplified version for Myers algorithm
   */
  private static calculateLineSimilarity(line1: string, line2: string): number {
    if (line1 === line2) {
      return 1.0;
    }
    if (!line1 || !line2) {
      return 0.0;
    }

    // Simple word-based similarity
    const words1 = line1.trim().split(/\s+/);
    const words2 = line2.trim().split(/\s+/);

    if (words1.length === 0 && words2.length === 0) {
      return 1.0;
    }
    if (words1.length === 0 || words2.length === 0) {
      return 0.0;
    }

    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  // ======================================
  // PERFORMANCE METRICS | MARK: METRICS
  // ======================================

  /**
   * Estimate the performance characteristics for given input sizes
   * Useful for algorithm selection
   */
  public static estimateComplexity(m: number, n: number): {
    timeComplexity: number;
    spaceComplexity: number;
    recommended: boolean;
  } {
    const maxSize = Math.max(m, n);
    const totalSize = m + n;
    
    // Estimate D (number of differences) as worst case 50% of total lines
    const estimatedD = Math.min(totalSize * 0.5, maxSize);
    
    const timeComplexity = totalSize * estimatedD;
    const spaceComplexity = totalSize;
    
    // Recommend Myers for larger files or when estimated performance is better
    const recommended = totalSize > 500 || timeComplexity < m * n;

    return {
      timeComplexity,
      spaceComplexity,
      recommended,
    };
  }
}

// ======================================
// TYPES | MARK: TYPES
// ======================================

/**
 * Internal edit operation for Myers algorithm
 */
interface DiffEdit {
  type: 'equal' | 'delete' | 'insert';
  oldIndex: number;
  newIndex: number;
  oldLine?: string;
  newLine?: string;
}