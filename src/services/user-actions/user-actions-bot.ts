/* ======================================
   User action bot | MARK: Dual Scroll
   ======================================= */

import { getEditorManager, isComparingMode } from '../main';

let syncScrollEnabled = false;
let isScrolling = false;
let onlyModifiedEnabled = false;

export function initializeDualScroll() {
    const dualScrollBtn = document.getElementById('dual-scroll-btn');
    const indicator = document.getElementById('dual-scroll-indicator');
         
    if (!dualScrollBtn) {
        console.warn('Dual scroll button not found');
        return;
    }
     
    dualScrollBtn.addEventListener('click', toggleDualScroll);
    
    // Add click listeners to indicators for deactivation
    const indicatorLeft = document.getElementById('dual-scroll-indicator-left');
    const indicatorRight = document.getElementById('dual-scroll-indicator-right');
    
    if (indicatorLeft) {
        indicatorLeft.addEventListener('click', toggleDualScroll);
    }
    if (indicatorRight) {
        indicatorRight.addEventListener('click', toggleDualScroll);
    }
     
    setupScrollListeners();
}

function toggleDualScroll() {
    syncScrollEnabled = !syncScrollEnabled;
    const indicatorLeft = document.getElementById('dual-scroll-indicator-left');
    const indicatorRight = document.getElementById('dual-scroll-indicator-right');
    const btn = document.getElementById('dual-scroll-btn');
         
    if (syncScrollEnabled) {
        if (indicatorLeft) {
            indicatorLeft.style.display = 'flex';
            indicatorLeft.textContent = '🔗';
        }
        if (indicatorRight) {
            indicatorRight.style.display = 'flex';
            indicatorRight.textContent = '🔗';
        }
        if (btn) {
            btn.classList.add('active');
        }
        console.log('Dual scroll activated');
    } else {
        if (indicatorLeft) {
            indicatorLeft.style.display = 'none';
        }
        if (indicatorRight) {
            indicatorRight.style.display = 'none';
        }
        if (btn) {
            btn.classList.remove('active');
        }
        console.log('Dual scroll deactivated');
    }
}

/* Main synchronization function - PRECISE SCROLL SYNC */
function syncScroll(sourceElement: HTMLElement, targetElement: HTMLElement) {
    if (!syncScrollEnabled || isScrolling) {
        return;
    }
         
    isScrolling = true;
    
    // Calculate precise scroll ratios
    const sourceMaxScroll = sourceElement.scrollHeight - sourceElement.clientHeight;
    const targetMaxScroll = targetElement.scrollHeight - targetElement.clientHeight;
    
    // Avoid division by zero
    if (sourceMaxScroll <= 0 || targetMaxScroll <= 0) {
        isScrolling = false;
        return;
    }
    
    // Calculate normalized scroll position (0 to 1)
    const sourceRatio = sourceElement.scrollTop / sourceMaxScroll;
    
    // Apply with smooth interpolation to target
    const targetScrollTop = sourceRatio * targetMaxScroll;
    
    // Ensure we don't exceed bounds
    const clampedScrollTop = Math.max(0, Math.min(targetScrollTop, targetMaxScroll));
    
        // Apply scroll with minimal delay for precision
    targetElement.scrollTop = clampedScrollTop;
    
    // Shorter timeout for more responsive sync
    setTimeout(() => { isScrolling = false; }, 16); // ~60fps
}

/* Set up scroll event listeners for all elements */
function setupScrollListeners() {
    const codeInput1 = document.getElementById('codeInput1') as HTMLTextAreaElement;
    const codeInput2 = document.getElementById('codeInput2') as HTMLTextAreaElement;
         
    const codeDisplay1 = document.getElementById('codeDisplay1') as HTMLElement;
    const codeDisplay2 = document.getElementById('codeDisplay2') as HTMLElement;

    if (codeInput1 && codeInput2) {
        codeInput1.addEventListener('scroll', () => syncScroll(codeInput1, codeInput2));
        codeInput2.addEventListener('scroll', () => syncScroll(codeInput2, codeInput1));
    }

    if (codeDisplay1 && codeDisplay2) {
        codeDisplay1.addEventListener('scroll', () => syncScroll(codeDisplay1, codeDisplay2));
        codeDisplay2.addEventListener('scroll', () => syncScroll(codeDisplay2, codeDisplay1));
    }
}

export function refreshScrollSync() {
    setupScrollListeners();
}

export function isDualScrollActive(): boolean {
    return syncScrollEnabled;
}

/* ======================================
   User button bot | MARK:CODE MODIFY
   ======================================= */

function toggleOnlyModified() {
    if (!isComparingMode()) {
        console.warn('Cannot toggle only modified mode: not in comparison mode');
        return;
    }

    const editorManager = getEditorManager();
    const { lines1 } = editorManager.getCurrentLines();
    const hasModified = lines1.some(line => line.type !== 'identical');

    if (onlyModifiedEnabled) {
        // Deactivating
        onlyModifiedEnabled = false;
        const btn = document.querySelector('.only-code.bbtn') as HTMLElement;
        if (btn) {
            btn.classList.remove('active');
        }
        console.log('Only modified mode deactivated');
        editorManager.renderFiltered(() => true);
    } else {
        // Activating
        if (!hasModified) {
            return;
        }
        onlyModifiedEnabled = true;
        const btn = document.querySelector('.only-code.bbtn') as HTMLElement;
        if (btn) {
            btn.classList.add('active');
        }
        console.log('Only modified mode activated');
        editorManager.renderFiltered(line => line.type !== 'identical');
    }
}

export function resetOnlyModified() {
    if (onlyModifiedEnabled) {
        onlyModifiedEnabled = false;
        const btn = document.querySelector('.only-code.bbtn') as HTMLElement;
        if (btn) {
            btn.classList.remove('active');
        }
    }
}

export function initializeOnlyCode() {
    const onlyCodeBtn = document.querySelector('.only-code.bbtn') as HTMLElement;
    if (!onlyCodeBtn) {
        console.warn('Only code button not found');
        return;
    }
    
    onlyCodeBtn.addEventListener('click', toggleOnlyModified);
}