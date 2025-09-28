import { initializeUserActions } from './user-actions/user-actions-top';
import { toggle, initializeCompareCode } from './diff-code/compare-code';

// INITIALIZE WHEN THE PAGE LOADS
document.addEventListener('DOMContentLoaded', () => {
  initializeUserActions();
  initializeCompareCode();
  (window as any).toggle = toggle;
});

export {};
