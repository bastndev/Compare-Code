/* ======================================
   User action bot | MARK: Bottom-Bar
   ======================================= */

let syncScrollEnabled = false;
let isScrolling = false;

export function initializeDualScroll() {
    const dualScrollBtn = document.getElementById('dual-scroll-btn');
    const indicator = document.getElementById('dual-scroll-indicator');
         
    if (!dualScrollBtn) {
        console.warn('Dual scroll button not found');
        return;
    }
     
    dualScrollBtn.addEventListener('click', toggleDualScroll);
     
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
        }
        if (indicatorRight) {
            indicatorRight.style.display = 'flex';
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

/* Main synchronization function */
function syncScroll(sourceElement: HTMLElement, targetElement: HTMLElement) {
    if (!syncScrollEnabled || isScrolling) {
        return;
    }
         
    isScrolling = true;
         
    const scrollPercentage = sourceElement.scrollTop / 
        (sourceElement.scrollHeight - sourceElement.clientHeight);
         
    const targetScrollTop = scrollPercentage * 
        (targetElement.scrollHeight - targetElement.clientHeight);
         
    targetElement.scrollTop = targetScrollTop;
         
    setTimeout(() => { isScrolling = false; }, 100);
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
   User action bot | MARK: OTHER
   ======================================= */