// Main entry point - coordinates all initializations
import { initializeUserActions } from './user-actions/user-actions-top';
import { initializeCompareGrid } from './diff-code/compare-code';

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeCompareGrid();
  initializeUserActions();
});

export {};
