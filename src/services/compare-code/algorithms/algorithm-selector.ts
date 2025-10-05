// ======================================
// ALGORITHM SELECTOR | MARK: SELECTOR
// ======================================

import { LineOperation } from '../../../utils/types';
import { ComparisonEngine } from './algorithms';
import { MyersAlgorithm } from './myers-algorithm';

/**
 * Intelligent algorithm selection for optimal performance
 * Automatically chooses between LCS and Myers based on input characteristics
 */
export class AlgorithmSelector {
  // ======================================
  // ALGORITHM SELECTION | MARK: SELECTION
  // ======================================

  /**
   * Select best algorithm based on input characteristics
   */
  public static selectBestAlgorithm(
    lines1: string[],
    lines2: string[]
  ): AlgorithmType {
    const analysis = this.analyzeInput(lines1, lines2);
    return analysis.shouldUseMyers ? 'myers' : 'lcs';
  }

  /**
   * Compute optimal line alignment using best algorithm
   * Main entry point that replaces direct algorithm calls
   */
  public static computeOptimalAlignment(
    lines1: string[],
    lines2: string[]
  ): LineOperation[] {
    const algorithm = this.selectBestAlgorithm(lines1, lines2);
    const startTime = performance.now();

    try {
      const result =
        algorithm === 'myers'
          ? MyersAlgorithm.computeLineAlignment(lines1, lines2)
          : ComparisonEngine.computeLineAlignment(lines1, lines2);

      const duration = performance.now() - startTime;

      // Log slow operations for debugging
      if (duration > 100) {
        console.log(
          `Algorithm: ${algorithm}, Lines: ${
            lines1.length + lines2.length
          }, Time: ${duration.toFixed(2)}ms`
        );
      }

      return result;
    } catch (error) {
      console.warn(
        `${algorithm} algorithm failed, falling back to LCS:`,
        error
      );

      // Fallback to LCS if Myers fails
      return algorithm === 'myers'
        ? ComparisonEngine.computeLineAlignment(lines1, lines2)
        : (() => {
            throw error;
          })(); // Re-throw if LCS fails
    }
  }

  // ======================================
  // INPUT ANALYSIS | MARK: ANALYSIS
  // ======================================

  /**
   * Analyze input characteristics for algorithm selection
   */
  private static analyzeInput(
    lines1: string[],
    lines2: string[]
  ): InputAnalysis {
    const m = lines1.length;
    const n = lines2.length;
    const totalLines = m + n;
    const maxLines = Math.max(m, n);
    const minLines = Math.min(m, n);

    const sizeRatio = minLines > 0 ? maxLines / minLines : maxLines;
    const similarity = this.estimateSimilarity(lines1, lines2);
    const lcsComplexity = m * n;
    const myersComplexity = this.estimateMyersComplexity(m, n, similarity);

    const shouldUseMyers = this.shouldUseMyers({
      totalLines,
      maxLines,
      sizeRatio,
      similarity,
      lcsComplexity,
      myersComplexity,
    });

    return {
      totalLines,
      maxLines,
      sizeRatio,
      similarity,
      lcsComplexity,
      myersComplexity,
      shouldUseMyers,
    };
  }

  /**
   * Decision logic for algorithm selection
   */
  private static shouldUseMyers(metrics: {
    totalLines: number;
    maxLines: number;
    sizeRatio: number;
    similarity: number;
    lcsComplexity: number;
    myersComplexity: number;
  }): boolean {
    const {
      totalLines,
      maxLines,
      sizeRatio,
      similarity,
      lcsComplexity,
      myersComplexity,
    } = metrics;

    // Always use Myers for very large files
    if (totalLines > 2000 || maxLines > 1000) {
      return true;
    }

    // Use Myers for medium files with good characteristics
    if (totalLines > 500) {
      if (similarity < 0.3) {
        return true;
      } // Very different files
      if (sizeRatio > 3) {
        return true;
      } // Unbalanced file sizes
      if (myersComplexity < lcsComplexity * 0.7) {
        return true;
      } // Better estimated performance
    }

    // Use LCS for small files
    if (totalLines < 200) {
      return false;
    }

    // For medium files, compare estimated performance
    return myersComplexity < lcsComplexity;
  }

  /**
   * Estimate Myers algorithm complexity based on input characteristics
   */
  private static estimateMyersComplexity(
    m: number,
    n: number,
    similarity: number
  ): number {
    const totalLines = m + n;
    const estimatedD = Math.max(1, totalLines * (1 - similarity) * 0.5);
    return totalLines * estimatedD;
  }

  /**
   * Estimate similarity by sampling lines for performance
   */
  private static estimateSimilarity(
    lines1: string[],
    lines2: string[]
  ): number {
    const sampleSize = Math.min(50, Math.max(lines1.length, lines2.length));
    if (sampleSize === 0) {
      return 1.0;
    }

    let matches = 0;
    const step1 = Math.max(1, Math.floor(lines1.length / sampleSize));
    const step2 = Math.max(1, Math.floor(lines2.length / sampleSize));

    // Sample lines and count exact matches
    const set2 = new Set();
    for (let i = 0; i < lines2.length; i += step2) {
      set2.add(lines2[i]);
    }

    for (let i = 0; i < lines1.length; i += step1) {
      if (set2.has(lines1[i])) {
        matches++;
      }
    }

    const sampledLines = Math.ceil(lines1.length / step1);
    return sampledLines > 0 ? matches / sampledLines : 0;
  }

  // ======================================
  // BENCHMARKING | MARK: BENCHMARK
  // ======================================

  /**
   * Compare performance of both algorithms for testing/debugging
   */
  public static benchmarkAlgorithms(
    lines1: string[],
    lines2: string[]
  ): BenchmarkResult {
    const startLcs = performance.now();
    const lcsResult = ComparisonEngine.computeLineAlignment(lines1, lines2);
    const lcsTime = performance.now() - startLcs;

    const startMyers = performance.now();
    const myersResult = MyersAlgorithm.computeLineAlignment(lines1, lines2);
    const myersTime = performance.now() - startMyers;

    return {
      lcs: { time: lcsTime, operations: lcsResult.length, result: lcsResult },
      myers: {
        time: myersTime,
        operations: myersResult.length,
        result: myersResult,
      },
      winner: lcsTime < myersTime ? 'lcs' : 'myers',
      speedup: Math.max(lcsTime, myersTime) / Math.min(lcsTime, myersTime),
    };
  }

  /**
   * Get algorithm selection statistics for debugging
   */
  public static getSelectionStats(
    lines1: string[],
    lines2: string[]
  ): SelectionStats {
    const analysis = this.analyzeInput(lines1, lines2);
    const selected = this.selectBestAlgorithm(lines1, lines2);

    return {
      selected,
      analysis,
      recommendation: analysis.shouldUseMyers ? 'myers' : 'lcs',
      confidence: this.calculateConfidence(analysis),
    };
  }

  /**
   * Calculate confidence in algorithm selection
   */
  private static calculateConfidence(analysis: InputAnalysis): number {
    const { totalLines, lcsComplexity, myersComplexity } = analysis;

    // High confidence for very large or very small files
    if (totalLines > 2000 || totalLines < 100) {
      return 0.95;
    }

    // Medium confidence based on complexity difference
    const complexityRatio =
      Math.abs(lcsComplexity - myersComplexity) /
      Math.max(lcsComplexity, myersComplexity);

    return Math.min(0.9, 0.5 + complexityRatio);
  }
}

// ======================================
// TYPES | MARK: TYPES
// ======================================

export type AlgorithmType = 'lcs' | 'myers';

interface InputAnalysis {
  totalLines: number;
  maxLines: number;
  sizeRatio: number;
  similarity: number;
  lcsComplexity: number;
  myersComplexity: number;
  shouldUseMyers: boolean;
}

interface BenchmarkResult {
  lcs: {
    time: number;
    operations: number;
    result: LineOperation[];
  };
  myers: {
    time: number;
    operations: number;
    result: LineOperation[];
  };
  winner: AlgorithmType;
  speedup: number;
}

interface SelectionStats {
  selected: AlgorithmType;
  analysis: InputAnalysis;
  recommendation: AlgorithmType;
  confidence: number;
}