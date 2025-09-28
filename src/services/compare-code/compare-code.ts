// ==========================================
// CORE COMPARISON ENGINE
// ==========================================

export type LineType = 'identical' | 'added' | 'removed' | 'modified' | 'empty';

export interface ComparisonLine {
  content: string;
  type: LineType;
}

export interface ComparisonStats {
  added: number;
  removed: number;
  modified: number;
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
   * Compare two text strings line by line
   * @param text1 First text to compare
   * @param text2 Second text to compare
   * @returns Comparison result with line-by-line differences and statistics
   */
  public static compare(text1: string, text2: string): ComparisonResult {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);

    const result1: ComparisonLine[] = [];
    const result2: ComparisonLine[] = [];
    const stats: ComparisonStats = { added: 0, removed: 0, modified: 0 };

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] !== undefined ? lines1[i] : '';
      const line2 = lines2[i] !== undefined ? lines2[i] : '';

      if (line1 === line2) {
        // Identical lines
        result1.push({ content: line1, type: 'identical' });
        result2.push({ content: line2, type: 'identical' });
      } else {
        // Different lines
        if (line1 !== '' && line2 === '') {
          // Removed line (only exists in code 1)
          result1.push({ content: line1, type: 'removed' });
          result2.push({ content: '', type: 'empty' });
          stats.removed++;
        } else if (line1 === '' && line2 !== '') {
          // Added line (only exists in code 2)
          result1.push({ content: '', type: 'empty' });
          result2.push({ content: line2, type: 'added' });
          stats.added++;
        } else {
          // Modified lines (both exist but are different)
          result1.push({ content: line1, type: 'modified' });
          result2.push({ content: line2, type: 'modified' });
          stats.modified++;
        }
      }
    }

    return { lines1: result1, lines2: result2, stats };
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
}