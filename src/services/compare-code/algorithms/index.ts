// ======================================
// ALGORITHMS INDEX | MARK: INDEX
// ======================================

/**
 * Main exports for the algorithms module
 * This provides a clean interface for importing comparison algorithms
 */

// Main comparison engine (LCS-based with movement detection)
export { ComparisonEngine } from './algorithms';

// Myers diff algorithm (optimized for large files)
export { MyersAlgorithm } from './myers-algorithm';

// Intelligent algorithm selector
export { AlgorithmSelector, type AlgorithmType } from './algorithm-selector';

// Re-export types for convenience
export type {
  ComparisonResult,
  ComparisonLine,
  ComparisonStats,
  LineOperation,
  MovedLine,
} from '../../../utils/types';