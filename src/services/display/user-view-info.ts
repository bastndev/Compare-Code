import { ComparisonStats } from '../../utils/types';

// ======================================
// USER INFORMATION MANAGER | MARK: MANAGER
// ======================================

function getI18n(): any {
  return (window as any).i18n;
}

/**
 * Manages the display of comparison statistics and user information
 */
export class UserInformationManager {
  // ======================================
  // STATISTICS DISPLAY | MARK: STATS
  // ======================================

  /**
   * Update the statistics display in the toolbar
   */
  public static updateStatsDisplay(stats: ComparisonStats): void {
    const addedElement = document.getElementById('added-count');
    const removedElement = document.getElementById('removed-count');
    const modifiedElement = document.getElementById('modified-count');
    const movedElement = document.getElementById('moved-count');
    const i18n = getI18n();

    if (addedElement) {
      const linesAddedText = i18n ? i18n.t('stats.linesAdded') : 'lines added';
      addedElement.innerHTML = `${stats.added} <span data-i18n="stats.linesAdded">${linesAddedText}</span>`;
    }
    if (removedElement) {
      const linesRemovedText = i18n
        ? i18n.t('stats.linesRemoved')
        : 'lines removed';
      removedElement.innerHTML = `${stats.removed} <span data-i18n="stats.linesRemoved">${linesRemovedText}</span>`;
    }
    if (modifiedElement) {
      const linesModifiedText = i18n
        ? i18n.t('stats.linesModified')
        : 'lines modified';
      modifiedElement.innerHTML = `${stats.modified} <span data-i18n="stats.linesModified">${linesModifiedText}</span>`;
    }
    if (movedElement) {
      const linesMovedText = i18n
        ? i18n.t('stats.linesMoved')
        : 'lines moved';
      movedElement.innerHTML = `${stats.moved} <span data-i18n="stats.linesMoved">${linesMovedText}</span>`;
    }
  }

  /**
   * Clear all statistics display (reset to zero)
   */
  public static clearStatsDisplay(): void {
    const addedElement = document.getElementById('added-count');
    const removedElement = document.getElementById('removed-count');
    const modifiedElement = document.getElementById('modified-count');
    const movedElement = document.getElementById('moved-count');
    const i18n = getI18n();

    if (addedElement) {
      const linesAddedText = i18n ? i18n.t('stats.linesAdded') : 'lines added';
      addedElement.innerHTML = `0 <span data-i18n="stats.linesAdded">${linesAddedText}</span>`;
    }
    if (removedElement) {
      const linesRemovedText = i18n
        ? i18n.t('stats.linesRemoved')
        : 'lines removed';
      removedElement.innerHTML = `0 <span data-i18n="stats.linesRemoved">${linesRemovedText}</span>`;
    }
    if (modifiedElement) {
      const linesModifiedText = i18n
        ? i18n.t('stats.linesModified')
        : 'lines modified';
      modifiedElement.innerHTML = `0 <span data-i18n="stats.linesModified">${linesModifiedText}</span>`;
    }
    if (movedElement) {
      const linesMovedText = i18n
        ? i18n.t('stats.linesMoved')
        : 'lines moved';
      movedElement.innerHTML = `0 <span data-i18n="stats.linesMoved">${linesMovedText}</span>`;
    }

    // Also hide the similar message when clearing stats
    this.hideSimilarMessage();
  }

  /**
   * Update the normal stats container with changes count and similarity score
   */
  public static updateNormalStats(
    stats: ComparisonStats,
    similarity: number
  ): void {
    const warningBox = document.querySelector('.warning-box span');
    const matchScore = document.querySelector('.match-score');
    const i18n = getI18n();

    if (warningBox) {
      const totalChanges = stats.added + stats.removed + stats.modified + stats.moved;
      const changesText = i18n ? i18n.t('stats.changes') : 'Changes';
      warningBox.innerHTML = `${totalChanges} : <span data-i18n="stats.changes">${changesText}</span>`;
    }

    if (matchScore) {
      const similarText = i18n ? i18n.t('stats.similar') : 'Similar';
      matchScore.innerHTML = `${similarity}% : <span data-i18n="stats.similar">${similarText}</span>`;
    }
  }

  //  ===========================================================
  //  Show similar message  (100% identical code)  MARK: message
  //  =========================================================
  public static showSimilarMessage(): void {
    const similarMessage = document.getElementById('similarMessage');
    if (similarMessage) {
      similarMessage.classList.add('visible');
      
      // Add a nice fade-in animation
      similarMessage.style.animation = 'fadeInScale 0.5s ease-out';
    }
  }

  /**
   * Hide similar message when code is not identical
   */
  public static hideSimilarMessage(): void {
    const similarMessage = document.getElementById('similarMessage');
    if (similarMessage) {
      similarMessage.classList.remove('visible');
      similarMessage.style.animation = '';
    }
  }

  // ======================================
  // NOTIFICATIONS | MARK: NOTIFICATIONS
  // ======================================

  /**
   * Show comparison summary information
   */
  public static showComparisonSummary(stats: ComparisonStats): void {
    const totalChanges = stats.added + stats.removed + stats.modified;
    const i18n = getI18n();

    if (totalChanges === 0) {
      const message = i18n
        ? i18n.t('messages.noChangesFound')
        : 'No differences found between the two code blocks';
      console.log(message);
    } else {
      const message = i18n
        ? i18n.t('messages.comparisonCompleted', totalChanges.toString())
        : `Comparison completed: ${totalChanges} total changes found`;
      console.log(message);
    }
  }

  /**
   * Display user notifications or alerts
   */
  public static showNotification(
    message: string,
    type: 'info' | 'warning' | 'error' = 'info'
  ): void {
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

  // ======================================
  // UI CONTROLS | MARK: CONTROLS
  // ======================================

  /**
   * Validate user input and show appropriate messages
   */
  public static validateInput(text1: string, text2: string): boolean {
    if (!text1.trim() && !text2.trim()) {
      const i18n = getI18n();
      const message = i18n
        ? i18n.t('messages.pleaseEnterCode')
        : 'Please enter code in at least one field';
      this.showNotification(message, 'warning');
      return false;
    }

    return true;
  }

  /**
   * Show loading state for long operations
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
   */
  public static updateButtonText(isComparing: boolean): void {
    const playButton = document.getElementById('playBtn');
    const buttonText = playButton?.querySelector('span');

    if (buttonText) {
      buttonText.textContent = isComparing ? 'Stop' : 'Compare';
    }
  }

  // ======================================
  // UTILITIES | MARK: UTILS
  // ======================================

  /**
   * Show keyboard shortcuts information
   */
  public static showKeyboardShortcuts(): void {
    const shortcuts = [
      'Ctrl + Enter: Toggle comparison',
      'Escape: Return to edit mode',
      'Tab: Insert indentation',
    ];

    console.log('Keyboard Shortcuts:', shortcuts.join(', '));
  }

  /**
   * Format file size or line count for display
   */
  public static formatCount(
    count: number,
    unit: 'lines' | 'chars' | 'bytes'
  ): string {
    if (count === 1) {
      return `1 ${unit.slice(0, -1)}`;
    }
    return `${count.toLocaleString()} ${unit}`;
  }

  /**
   * Calculate and display performance metrics
   */
  public static showPerformanceMetrics(
    startTime: number,
    endTime: number
  ): void {
    const duration = endTime - startTime;
    console.log(`Comparison completed in ${duration.toFixed(2)}ms`);
  }
}