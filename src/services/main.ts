import { initializeUserActions } from './user-actions/user-actions-top';
import { initializeDualScroll, initializeOnlyCode, resetOnlyModified } from './user-actions/user-actions-bot';
import { ComparisonEngine, ComparisonResult } from './compare-code/algorithms';
import { EditorManager } from './compare-code/ui-comparator';
import { UserInformationManager } from './userShowInformation';
import { setPlayBtnToEdit, setPlayBtnToCompare } from './user-actions/user-actions-top';

// ==========================================
// MAIN APPLICATION STATE  
// ==========================================

let isComparing: boolean = false;
let editorManager: EditorManager;

// ==========================================
// PUBLIC API - Main Functions
// ==========================================

/**
 * Toggle between edit and compare modes
 */
export function toggle(): void {
  if (isComparing) {
    reset();
  } else {
    compare();
  }
}

/**
 * Start code comparison
 */
export function compare(): void {
  try {
    if (!editorManager) {
      console.error('Editor manager not initialized');
      return;
    }

    const text1 = editorManager.getContent('1');
    const text2 = editorManager.getContent('2');

    if (!text1.trim() && !text2.trim()) {
      alert('Please enter code in at least one field');
      return;
    }

    // Perform comparison
    const comparison: ComparisonResult = ComparisonEngine.compare(text1, text2);
    
    // Switch to compare mode
    editorManager.setCompareMode(comparison.lines1, comparison.lines2);

    // Update UI state
    isComparing = true;
    setPlayBtnToEdit();
    UserInformationManager.updateStatsDisplay(comparison.stats);

  } catch (error) {
    console.error('Comparison failed:', error);
    alert('An error occurred during comparison. Please try again.');
  }
}

/**
 * Reset to edit mode
 */
export function reset(): void {
  try {
    if (!editorManager) {
      console.error('Editor manager not initialized');
      return;
    }

    // Return to edit mode
    editorManager.setEditMode();

    // Update UI state
    isComparing = false;
    setPlayBtnToCompare();
    UserInformationManager.clearStatsDisplay();
    resetOnlyModified();

  } catch (error) {
    console.error('Reset failed:', error);
  }
}

/**
 * Clear all editor content
 */
export function clearAll(): void {
  if (editorManager) {
    editorManager.clearAll();
    
    // Reset to edit mode if in comparison
    if (isComparing) {
      reset();
    }
  }
}

/**
 * Get the editor manager instance
 */
export function getEditorManager(): EditorManager {
  return editorManager;
}

/**
 * Check if currently in comparison mode
 */
export function isComparingMode(): boolean {
  return isComparing;
}

/**
 * Initialize the complete compare code system
 */
export function initializeCompareCode(): void {
  try {
    // Initialize editor manager
    editorManager = new EditorManager();

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        reset();
      }
    });

    console.log('Compare Code initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize Compare Code:', error);
  }
}

// INITIALIZE WHEN THE PAGE LOADS
document.addEventListener('DOMContentLoaded', () => {
  initializeUserActions();
  initializeDualScroll();
  initializeOnlyCode();
  initializeCompareCode();
  (window as any).toggle = toggle;
  (window as any).clearAll = clearAll;
});
