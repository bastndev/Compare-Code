// ======================================
// USER ACTIONS BOT | MARK: BOT
// ======================================

import { getEditorManager, isComparingMode } from '../main';

let syncScrollEnabled = false;
let isScrolling = false;
let onlyModifiedEnabled = false;

// ======================================
// DUAL SCROLL | MARK: SCROLL
// ======================================

export function initializeDualScroll() {
  const dualScrollBtn = document.getElementById('dual-scroll-btn');

  if (!dualScrollBtn) {
    console.warn('Dual scroll button not found');
    return;
  }

  dualScrollBtn.addEventListener('click', toggleDualScroll);

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
  }
}

function syncScroll(sourceElement: HTMLElement, targetElement: HTMLElement) {
  if (!syncScrollEnabled || isScrolling) {
    return;
  }

  isScrolling = true;

  const sourceMaxScroll =
    sourceElement.scrollHeight - sourceElement.clientHeight;
  const targetMaxScroll =
    targetElement.scrollHeight - targetElement.clientHeight;

  if (sourceMaxScroll <= 0 || targetMaxScroll <= 0) {
    isScrolling = false;
    return;
  }

  const sourceRatio = sourceElement.scrollTop / sourceMaxScroll;
  const targetScrollTop = sourceRatio * targetMaxScroll;
  const clampedScrollTop = Math.max(
    0,
    Math.min(targetScrollTop, targetMaxScroll)
  );

  targetElement.scrollTop = clampedScrollTop;

  setTimeout(() => {
    isScrolling = false;
  }, 16);
}

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

// ======================================
// ONLY MODIFIED | MARK: FILTER
// ======================================

function toggleOnlyModified() {
  if (!isComparingMode()) {
    return;
  }

  const editorManager = getEditorManager();
  const { lines1 } = editorManager.getCurrentLines();
  const hasModified = lines1.some((line) => line.type !== 'identical');

  if (onlyModifiedEnabled) {
    onlyModifiedEnabled = false;
    const btn = document.querySelector('.only-code.bbtn') as HTMLElement;
    if (btn) {
      btn.classList.remove('active');
    }
    editorManager.renderFiltered(() => true);
  } else {
    if (!hasModified) {
      return;
    }
    onlyModifiedEnabled = true;
    const btn = document.querySelector('.only-code.bbtn') as HTMLElement;
    if (btn) {
      btn.classList.add('active');
    }
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

// ======================================
// SWITCH MODE | MARK: SWITCH
// ======================================

let isProMode: boolean = false;
let switchOnUri: string;
let switchOffUri: string;

export function initializeSwitchMode() {
  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.type === 'setIcons') {
      switchOnUri = message.icons.switchOn;
      switchOffUri = message.icons.switchOff;
    }
  });
}

export function toggleSwitchMode(): void {
  isProMode = !isProMode;

  const icon = document.querySelector(
    '.switch-on-off .icon'
  ) as HTMLImageElement;

  if (icon) {
    const currentSrc = icon.src;
    let onUri = switchOnUri;
    let offUri = switchOffUri;

    if (!onUri || !offUri) {
      const baseSrc = currentSrc.replace(/switch-(on|off)\.svg.*$/, '');
      onUri = baseSrc + 'switch-on.svg';
      offUri = baseSrc + 'switch-off.svg';
    }

    icon.style.opacity = '0';
    setTimeout(() => {
      const newSrc = isProMode ? offUri : onUri;
      icon.src = newSrc;
      icon.style.opacity = '1';
    }, 150);
  }

  const normalStats = document.getElementById('normal-stats');
  const proStats = document.getElementById('pro-stats');
  if (normalStats && proStats) {
    if (isProMode) {
      normalStats.style.opacity = '0';
      setTimeout(() => {
        normalStats.style.visibility = 'hidden';
        proStats.style.opacity = '1';
        proStats.style.visibility = 'visible';
      }, 250);
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

// ======================================
// LANGUAGE SELECTOR | MARK: LANGUAGE
// ======================================

function getI18n(): any {
  return (window as any).i18n;
}

declare const vscode: any;

function initializeLanguageSelector(): void {
  const languageBtn = document.querySelector('.language') as HTMLElement;
  if (languageBtn) {
    const dropdown = createLanguageDropdown();
    languageBtn.appendChild(dropdown);

    languageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShown = dropdown.classList.contains('show');
      
      if (isShown) {
        closeDropdown(dropdown);
      } else {
        // Update selection before showing dropdown
        updateSelectedLanguage(dropdown);
        dropdown.classList.remove('closing');
        dropdown.classList.add('show');
      }
    });

    document.addEventListener('click', () => {
      closeDropdown(dropdown);
    });
    
    // Update selection after i18n is fully initialized
    setTimeout(() => {
      updateSelectedLanguage(dropdown);
    }, 50);
    
    // Also update when language changes from i18n service
    window.addEventListener('languageChanged', () => {
      updateSelectedLanguage(dropdown);
    });
  }
}

function closeDropdown(dropdown: HTMLElement): void {
  if (dropdown.classList.contains('show')) {
    dropdown.classList.add('closing');
    dropdown.classList.remove('show');
    
    setTimeout(() => {
      dropdown.classList.remove('closing');
    }, 250); // Duration of the "closing" animation
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
      
      // Remove previous selection
      dropdown.querySelectorAll('.language-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Add 'selected' to current option
      option.classList.add('selected');
      
      // Change language
      changeLanguage(lang.code);
      
      // Close dropdown
      closeDropdown(dropdown);
    });

    dropdown.appendChild(option);
  });

  return dropdown;
}

/**
 * Update the selected language in the dropdown
 */
function updateSelectedLanguage(dropdown: HTMLElement): void {
  const currentLang = getCurrentLanguage();
  const options = dropdown.querySelectorAll('.language-option');
  
  options.forEach((option) => {
    const langCode = (option as HTMLElement).dataset.lang;
    if (langCode === currentLang) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

function getCurrentLanguage(): string {
  const i18n = getI18n();
  return i18n?.getCurrentLanguage?.() || i18n?.currentLanguage || 'en';
}

function changeLanguage(langCode: string): void {
  const i18n = getI18n();
  if (i18n) {
    i18n.setLanguage(langCode);

    vscode.postMessage({
      command: 'changeLanguage',
      language: langCode,
    });
  }
}

export function initializeLanguageMenu(): void {
  initializeLanguageSelector();
}