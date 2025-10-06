import { initializeUserActions } from './user-actions/user-actions-top';
import { ComparisonEngine } from './compare-code/algorithms';
import { ComparisonResult } from '../utils/types';
import { EditorManager } from './compare-code/ui-comparator';
import { UserInformationManager } from './display/user-view-info';
import {setPlayBtnToEdit,setPlayBtnToCompare,} from './user-actions/user-actions-top';
import {initializeDualScroll,initializeOnlyCode,resetOnlyModified,initializeSwitchMode,toggleSwitchMode,initializeLanguageMenu,} from './user-actions/user-actions-bot';
import { 
  showPerfectMatchEffect, 
  hidePerfectMatchEffect,
  MATCH_EFFECT_CONFIG 
} from './display/match-effect';

// ======================================
// MAIN APPLICATION | MARK: MAIN
// ======================================

let isComparing: boolean = false;
let editorManager: EditorManager;

// ======================================
// CORE FUNCTIONS | MARK: CORE
// ======================================

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

    // Validate that both inputs have content
    if (!text1.trim() || !text2.trim()) {
      alert('Both code areas must have content to compare');
      return;
    }

    const comparison: ComparisonResult = ComparisonEngine.compare(text1, text2);

    editorManager.setCompareMode(comparison.lines1, comparison.lines2);

    isComparing = true;
    setPlayBtnToEdit();
    UserInformationManager.updateStatsDisplay(comparison.stats);
    UserInformationManager.updateNormalStats(
      comparison.stats,
      comparison.similarity
    );

    // Check for perfect match (100% similarity AND no differences)
    const isPerfectMatch = comparison.similarity === 100 && 
                          comparison.stats.added === 0 && 
                          comparison.stats.removed === 0 && 
                          comparison.stats.modified === 0;
    
    if (isPerfectMatch) {
      // Show perfect match effect overlay
      showPerfectMatchEffect();
      
      // Hide effect after animation completes
      setTimeout(() => {
        hidePerfectMatchEffect();
      }, MATCH_EFFECT_CONFIG.HIDE_DELAY);
    }
  } catch (error) {
    console.error('Comparison failed:', error);
    setPlayBtnToCompare(); // Reset button state on error
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

    editorManager.setEditMode();

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

    if (isComparing) {
      reset();
    }
  }
}

// ======================================
// PUBLIC API | MARK: API
// ======================================

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

// ======================================
// INITIALIZATION | MARK: INIT
// ======================================

/**
 * Initialize the complete compare code system
 */
export function initializeCompareCode(): void {
  try {
    editorManager = new EditorManager();

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        reset();
      }

      if (e.shiftKey && e.altKey && e.key === 'Backspace') {
        e.preventDefault();
        clearAll();
      }
    });
  } catch (error) {
    console.error('Failed to initialize Compare Code:', error);
  }
}

// ======================================
// APPLICATION STARTUP | MARK: STARTUP
// ======================================

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializeUserActions();
    initializeDualScroll();
    initializeOnlyCode();
    initializeSwitchMode();
    initializeLanguageMenu();
    initializeCompareCode();

    // Global functions
    (window as any).toggle = toggle;
    (window as any).clearAll = clearAll;
    (window as any).toggleSwitchMode = toggleSwitchMode;
  }, 100);
});
