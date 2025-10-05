// ======================================
// MYERS DIFF ALGORITHM | MARK: MYERS
// ======================================

import { LineOperation, LineOperationType } from '../../../utils/types';

/**
 * Myers diff algorithm implementation
 * Based on Eugene Myers' O(ND) algorithm - industry standard used by Git
 * Optimized for large files with better performance than LCS
 */
export class MyersAlgorithm {
  // ======================================
  // MAIN ALGORITHM | MARK: MAIN
  // ======================================

  /**
   * Compute line alignment using Myers algorithm
   * Complexity: O((M+N)*D) where D = number of differences
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

    // Run Myers algorithm and convert to operations
    const edits = this.myersDiff(lines1, lines2);
    return this.buildOperationsFromEdits(edits, lines1, lines2);
  }

  // ======================================
  // CORE IMPLEMENTATION | MARK: CORE
  // ======================================

  /**
   * Core Myers diff algorithm - finds shortest edit sequence
   */
  private static myersDiff(lines1: string[], lines2: string[]): DiffEdit[] {
    const m = lines1.length;
    const n = lines2.length;
    const max = m + n;

    // V array stores furthest reaching D-path in diagonal k
    const v: number[] = new Array(2 * max + 1);
    v[max + 1] = 0;

    const trace: number[][] = [];

    // Forward search to find shortest edit script
    for (let d = 0; d <= max; d++) {
      trace.push([...v]);

      for (let k = -d; k <= d; k += 2) {
        const kIndex = k + max;
        let x: number;

        // Choose path: deletion (k+1) or insertion (k-1)
        if (k === -d || (k !== d && v[kIndex - 1] < v[kIndex + 1])) {
          x = v[kIndex + 1]; // Deletion
        } else {
          x = v[kIndex - 1] + 1; // Insertion
        }

        let y = x - k;

        // Extend diagonal as far as possible
        while (x < m && y < n && lines1[x] === lines2[y]) {
          x++;
          y++;
        }

        v[kIndex] = x;

        // Check if we reached the end
        if (x >= m && y >= n) {
          return this.buildEditScriptFromTrace(trace, lines1, lines2, d);
        }
      }
    }

    return []; // Should never reach here
  }

  /**
   * Build edit script by backtracking through trace
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

    // Backtrack through trace to build edit script
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

      // Add diagonal moves (identical lines)
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

      // Add edit operation
      if (x > prevX) {
        x--;
        edits.unshift({
          type: 'delete',
          oldIndex: x,
          newIndex: y,
          oldLine: lines1[x],
          newLine: undefined,
        });
      } else if (y > prevY) {
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

    // Add remaining diagonal moves
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
  // CONVERSION | MARK: CONVERT
  // ======================================

  /**
   * Convert Myers edit script to LineOperation format
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
          operations.push({ type: 'removed', line1: edit.oldLine! });
          break;
        case 'insert':
          operations.push({ type: 'added', line2: edit.newLine! });
          break;
      }
    }

    return this.detectModifiedLines(operations);
  }

  /**
   * Detect modified lines from adjacent delete/insert pairs
   */
  private static detectModifiedLines(
    operations: LineOperation[]
  ): LineOperation[] {
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
        const similarity = this.calculateLineSimilarity(
          current.line1,
          next.line2
        );

        if (similarity > 0.3) {
          result.push({
            type: 'modified',
            line1: current.line1,
            line2: next.line2,
          });
          i += 2; // Skip both operations
        } else {
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
   * Calculate line similarity using simple word-based approach
   */
  private static calculateLineSimilarity(line1: string, line2: string): number {
    if (line1 === line2) {
      return 1.0;
    }
    if (!line1 || !line2) {
      return 0.0;
    }

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
   * Estimate performance characteristics for algorithm selection
   */
  public static estimateComplexity(
    m: number,
    n: number
  ): {
    timeComplexity: number;
    spaceComplexity: number;
    recommended: boolean;
  } {
    const totalSize = m + n;
    const estimatedD = Math.min(totalSize * 0.5, Math.max(m, n));

    const timeComplexity = totalSize * estimatedD;
    const spaceComplexity = totalSize;
    const recommended = totalSize > 500 || timeComplexity < m * n;

    return { timeComplexity, spaceComplexity, recommended };
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