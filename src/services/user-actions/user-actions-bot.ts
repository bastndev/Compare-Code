/* ======================================
   User action bot | MARK: Dual Scroll
   ======================================= */

import { getEditorManager, isComparingMode } from '../main';

let syncScrollEnabled = false;
let isScrolling = false;
let onlyModifiedEnabled = false;

export function initializeDualScroll() {
  const dualScrollBtn = document.getElementById('dual-scroll-btn');

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
  const sourceMaxScroll =
    sourceElement.scrollHeight - sourceElement.clientHeight;
  const targetMaxScroll =
    targetElement.scrollHeight - targetElement.clientHeight;

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
  const clampedScrollTop = Math.max(
    0,
    Math.min(targetScrollTop, targetMaxScroll)
  );

  // Apply scroll with minimal delay for precision
  targetElement.scrollTop = clampedScrollTop;

  // Shorter timeout for more responsive sync
  setTimeout(() => {
    isScrolling = false;
  }, 16); // ~60fps
}

/* Set up scroll event listeners for all elements */
function setupScrollListeners() {
  const codeInput1 = document.getElementById(
    'codeInput1'
  ) as HTMLTextAreaElement;
  const codeInput2 = document.getElementById(
    'codeInput2'
  ) as HTMLTextAreaElement;

  const codeDisplay1 = document.getElementById('codeDisplay1') as HTMLElement;
  const codeDisplay2 = document.getElementById('codeDisplay2') as HTMLElement;

  if (codeInput1 && codeInput2) {
    codeInput1.addEventListener('scroll', () =>
      syncScroll(codeInput1, codeInput2)
    );
    codeInput2.addEventListener('scroll', () =>
      syncScroll(codeInput2, codeInput1)
    );
  }

  if (codeDisplay1 && codeDisplay2) {
    codeDisplay1.addEventListener('scroll', () =>
      syncScroll(codeDisplay1, codeDisplay2)
    );
    codeDisplay2.addEventListener('scroll', () =>
      syncScroll(codeDisplay2, codeDisplay1)
    );
  }
}

export function refreshScrollSync() {
  setupScrollListeners();
}

export function isDualScrollActive(): boolean {
  return syncScrollEnabled;
}

/* ======================================
   User button bar | MARK:CODE MODIFY
   ======================================= */

function toggleOnlyModified() {
  if (!isComparingMode()) {
    console.warn('Cannot toggle only modified mode: not in comparison mode');
    return;
  }

  const editorManager = getEditorManager();
  const { lines1 } = editorManager.getCurrentLines();
  const hasModified = lines1.some((line) => line.type !== 'identical');

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
    editorManager.renderFiltered((line) => line.type !== 'identical');
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

/* ======================================
   User actions - button bar | MARK:NORMAL/PRO
   ======================================= */
let isProMode: boolean = false;
let switchOnUri: string;
let switchOffUri: string;

export function initializeSwitchMode() {
  console.log('  - Initializing switch mode...');

  // Message listener for switch icons
  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.type === 'setIcons') {
      switchOnUri = message.icons.switchOn;
      switchOffUri = message.icons.switchOff;
      console.log('  - Switch icons received:', { switchOnUri, switchOffUri });
    }
  });

  // Initial state: show normal stats, hide pro stats
  const normalStats = document.getElementById('normal-stats');
  const proStats = document.getElementById('pro-stats');
  if (normalStats) {
    normalStats.style.opacity = '1';
    normalStats.style.visibility = 'visible';
  }
  if (proStats) {
    proStats.style.opacity = '0';
    proStats.style.visibility = 'hidden';
  }

  console.log('  - Switch mode initialized successfully!');
}

export function toggleSwitchMode(): void {
  isProMode = !isProMode;
  console.log('Toggle switch mode:', { isProMode, switchOnUri, switchOffUri });

  const icon = document.querySelector(
    '.switch-on-off .icon'
  ) as HTMLImageElement;

  if (icon) {
    const currentSrc = icon.src;
    console.log('Current icon src:', currentSrc);

    // Try to get icon URIs from the received message first
    let onUri = switchOnUri;
    let offUri = switchOffUri;
    
    // If URIs are not available from message, try to construct them from current src
    if (!onUri || !offUri) {
      console.log('Constructing icon URIs from current src...');
      const baseSrc = currentSrc.replace(/switch-(on|off)\.svg.*$/, '');
      onUri = baseSrc + 'switch-on.svg';
      offUri = baseSrc + 'switch-off.svg';
      console.log('Constructed URIs:', { onUri, offUri });
    }
    
    // Change icon with animation
    icon.style.opacity = '0';
    setTimeout(() => {
      const newSrc = isProMode ? offUri : onUri;
      console.log('Setting new icon src:', newSrc);
      icon.src = newSrc;
      icon.style.opacity = '1';
    }, 150);
  } else {
    console.error('Switch icon element not found');
  }

  // Toggle stats display
  const normalStats = document.getElementById('normal-stats');
  const proStats = document.getElementById('pro-stats');
  if (normalStats && proStats) {
    if (isProMode) {
      normalStats.style.opacity = '0';
      setTimeout(() => {
        normalStats.style.visibility = 'hidden';
        proStats.style.opacity = '1';
        proStats.style.visibility = 'visible';
      }, 250); // Half of transition time
    } else {
      proStats.style.opacity = '0';
      setTimeout(() => {
        proStats.style.visibility = 'hidden';
        normalStats.style.opacity = '1';
        normalStats.style.visibility = 'visible';
      }, 250);
    }
  }
}

/* ==========================================
   User actions - button bar | MARK: LANGUAGE 
   ========================================== */

// Helper function to get i18n service from global scope
function getI18n(): any {
  return (window as any).i18n;
}

// Use the global vscode API (declared in user-actions-top.ts)
declare const vscode: any;

// LANGUAGE SELECTOR
function initializeLanguageSelector(): void {
  const languageBtn = document.querySelector('.language') as HTMLElement;
  if (languageBtn) {
    // Create language dropdown menu
    const dropdown = createLanguageDropdown();
    languageBtn.appendChild(dropdown);

    languageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });
  }
}

function createLanguageDropdown(): HTMLElement {
  const dropdown = document.createElement('div');
  dropdown.className = 'language-dropdown';

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  languages.forEach((lang) => {
    const option = document.createElement('div');
    option.className = 'language-option';
    option.innerHTML = `${lang.flag} ${lang.name}`;
    option.dataset.lang = lang.code;

    option.addEventListener('click', (e) => {
      e.stopPropagation();
      changeLanguage(lang.code);
      dropdown.classList.remove('show');
    });

    dropdown.appendChild(option);
  });

  return dropdown;
}

function changeLanguage(langCode: string): void {
  const i18n = getI18n();
  if (i18n) {
    i18n.setLanguage(langCode);
    console.log(`Language changed to: ${langCode}`);

    // Notify extension about language change
    vscode.postMessage({
      command: 'changeLanguage',
      language: langCode,
    });
  }
}

export function initializeLanguageMenu(): void {
  initializeLanguageSelector();
}
