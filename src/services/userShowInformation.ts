import { ComparisonStats } from './compare-code/algorithms';

// ==========================================
// USER INFORMATION & STATISTICS DISPLAY
// ==========================================

/**
 * Manages the display of comparison statistics and user information
 */
export class UserInformationManager {
  
  /**
   * Update the statistics display in the toolbar
   * @param stats Comparison statistics to display
   */
  public static updateStatsDisplay(stats: ComparisonStats): void {
    const addedElement = document.getElementById('added-count');
    const removedElement = document.getElementById('removed-count');
    const modifiedElement = document.getElementById('modified-count');
    
    if (addedElement) {
      addedElement.textContent = `${stats.added} lines added`;
    }
    if (removedElement) {
      removedElement.textContent = `${stats.removed} lines removed`;
    }
    if (modifiedElement) {
      modifiedElement.textContent = `${stats.modified} lines modified`;
    }
  }

  /**
   * Clear all statistics display (reset to zero)
   */
  public static clearStatsDisplay(): void {
    const addedElement = document.getElementById('added-count');
    const removedElement = document.getElementById('removed-count');
    const modifiedElement = document.getElementById('modified-count');
    
    if (addedElement) {
      addedElement.textContent = '0 lines added';
    }
    if (removedElement) {
      removedElement.textContent = '0 lines removed';
    }
    if (modifiedElement) {
      modifiedElement.textContent = '0 lines modified';
    }
  }

  /**
   * Show comparison summary information
   * @param stats Comparison statistics
   */
  public static showComparisonSummary(stats: ComparisonStats): void {
    const totalChanges = stats.added + stats.removed + stats.modified;
    
    if (totalChanges === 0) {
      console.log('No differences found between the two code blocks');
    } else {
      console.log(`Comparison completed: ${totalChanges} total changes found`);
    }
  }

  /**
   * Display user notifications or alerts
   * @param message Message to display
   * @param type Type of notification (info, warning, error)
   */
  public static showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    // For now using alert, can be enhanced with custom notifications later
    switch (type) {
      case 'error':
        alert(`Error: ${message}`);
        break;
      case 'warning':
        alert(`Warning: ${message}`);
        break;
      default:
        console.log(`Info: ${message}`);
        break;
    }
  }

// ==========================================
// USER INFORMATION | MARK: ITEM A-R-M
// ==========================================

  /**
   * Validate user input and show appropriate messages
   * @param text1 First text input
   * @param text2 Second text input
   * @returns True if validation passes
   */
  public static validateInput(text1: string, text2: string): boolean {
    if (!text1.trim() && !text2.trim()) {
      this.showNotification('Please enter code in at least one field', 'warning');
      return false;
    }
    
    return true;
  }

  /**
   * Show loading state for long operations
   * @param isLoading Whether to show or hide loading state
   */
  public static showLoadingState(isLoading: boolean): void {
    const playButton = document.getElementById('playBtn');
    if (playButton) {
      if (isLoading) {
        playButton.classList.add('loading');
        playButton.setAttribute('disabled', 'true');
      } else {
        playButton.classList.remove('loading');
        playButton.removeAttribute('disabled');
      }
    }
  }

  /**
   * Update button text based on current mode
   * @param isComparing Whether currently in comparison mode
   */
  public static updateButtonText(isComparing: boolean): void {
    const playButton = document.getElementById('playBtn');
    const buttonText = playButton?.querySelector('span');
    
    if (buttonText) {
      buttonText.textContent = isComparing ? 'Stop' : 'Compare';
    }
  }

  /**
   * Show keyboard shortcuts information
   */
  public static showKeyboardShortcuts(): void {
    const shortcuts = [
      'Ctrl + Enter: Toggle comparison',
      'Escape: Return to edit mode',
      'Tab: Insert indentation'
    ];
    
    console.log('Keyboard Shortcuts:', shortcuts.join(', '));
  }

  /**
   * Format file size or line count for display
   * @param count Number to format
   * @param unit Unit type (lines, chars, bytes)
   * @returns Formatted string
   */
  public static formatCount(count: number, unit: 'lines' | 'chars' | 'bytes'): string {
    if (count === 1) {
      return `1 ${unit.slice(0, -1)}`; // Remove 's' for singular
    }
    return `${count.toLocaleString()} ${unit}`;
  }

  /**
   * Calculate and display performance metrics
   * @param startTime Start time of operation
   * @param endTime End time of operation
   */
  public static showPerformanceMetrics(startTime: number, endTime: number): void {
    const duration = endTime - startTime;
    console.log(`Comparison completed in ${duration.toFixed(2)}ms`);
  }


// ==========================================
// USER INFORMATION | MARK: WARNING
// ==========================================

  /**
   * Update the warning container with changes count and similarity score
   * @param stats Comparison statistics
   * @param similarity Similarity percentage
   */
  public static updateWarningContainer(stats: ComparisonStats, similarity: number): void {
    const warningBox = document.querySelector('.warning-box span');
    const matchScore = document.querySelector('.match-score');
    
    if (warningBox) {
      const totalChanges = stats.added + stats.removed + stats.modified;
      warningBox.textContent = `${totalChanges} : Changes`;
    }
    
    if (matchScore) {
      matchScore.textContent = `${similarity}% : Similar`;
    }
  }
}
