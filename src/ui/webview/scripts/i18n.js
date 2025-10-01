// ======================================
// I18N SERVICE FOR WEBVIEW | MARK: I18N
// ======================================

(function () {
  'use strict';

  let translations = {};
  let currentLanguage = 'en';

  /**
   * Detect user's preferred language from VS Code or browser
   */
  function detectLanguage() {
    try {
      const vscodeLocale = window.vscode?.env?.language;
      if (vscodeLocale) {
        return mapLanguageCode(vscodeLocale);
      }
      const browserLang =
        navigator.language || navigator.languages?.[0] || 'en';
      return mapLanguageCode(browserLang);
    } catch (error) {
      console.warn('Could not detect language:', error);
      return 'en';
    }
  }

  /**
   * Map language codes to supported languages
   */
  function mapLanguageCode(langCode) {
    const code = langCode.toLowerCase().split('-')[0];
    switch (code) {
      case 'es':
        return 'es';
      case 'pt':
        return 'pt';
      case 'zh':
        return 'zh';
      case 'en':
      default:
        return 'en';
    }
  }

  /**
   * Get translated text by key path
   */
  function t(keyPath, ...args) {
    try {
      const keys = keyPath.split('.');
      let value = translations[currentLanguage];

      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) {
          break;
        }
      }

      if (typeof value !== 'string') {
        console.warn('Translation not found for key:', keyPath);
        return keyPath;
      }

      return value.replace(/\{(\d+)\}/g, (match, index) => {
        const argIndex = parseInt(index, 10);
        return args[argIndex] !== undefined ? args[argIndex] : match;
      });
    } catch (error) {
      console.error('Error getting translation for', keyPath, ':', error);
      return keyPath;
    }
  }

  /**
   * Change current language
   */
  function setLanguage(language) {
    if (translations[language]) {
      currentLanguage = language;
      updateUI();
      try {
        localStorage.setItem('compareCode.language', language);
      } catch (error) {
        console.warn('Could not save language preference:', error);
      }
    }
  }

  /**
   * Get current language
   */
  function getCurrentLanguage() {
    return currentLanguage;
  }

  /**
   * Update UI with current language
   */
  function updateUI() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translatedText = t(key);
        const attr = element.getAttribute('data-i18n-attr');
        if (attr) {
          element.setAttribute(attr, translatedText);
        } else {
          element.textContent = translatedText;
        }
      }
    });

    window.dispatchEvent(
      new CustomEvent('languageChanged', {
        detail: { language: currentLanguage },
      })
    );
  }

  /**
   * Initialize i18n service with translations
   */
  function init(translationsData) {
    if (translationsData) {
      translations = translationsData;
    }

    try {
      const savedLang = localStorage.getItem('compareCode.language');
      if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
      } else {
        currentLanguage = detectLanguage();
      }
    } catch (error) {
      console.warn('Could not load language preference:', error);
      currentLanguage = detectLanguage();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateUI);
    } else {
      updateUI();
    }
  }

  // ======================================
  // GLOBAL API | MARK: API
  // ======================================

  window.i18n = {
    t: t,
    setLanguage: setLanguage,
    getCurrentLanguage: getCurrentLanguage,
    init: init,
  };

  console.log('i18n service loaded and ready');
})();
