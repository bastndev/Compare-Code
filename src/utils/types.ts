// ==========================================
// SHARED TYPE DEFINITIONS
// ==========================================

// Basic types for comparison operations
export type LineType = 'identical' | 'added' | 'removed' | 'modified' | 'empty';
export type TokenType = 'word' | 'whitespace' | 'punctuation' | 'operator' | 'number';
export type DiffOperationType = 'unchanged' | 'added' | 'removed' | 'modified';
export type LineOperationType = 'identical' | 'added' | 'removed' | 'modified';

// Token-related interfaces
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

// Comparison-related interfaces
export interface ComparisonLine {
  content: string;
  type: LineType;
  htmlContent?: string;
  originalLineNumber?: number;
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
  originalIndex1?: number;
  originalIndex2?: number;
}

export interface ComparisonResult {
  lines1: ComparisonLine[];
  lines2: ComparisonLine[];
  stats: ComparisonStats;
  similarity: number;
}