// ==========================================
// INTERNATIONALIZATION SERVICE
// ==========================================

interface Translations {
  stats: {
    changes: string;
    similar: string;
    linesAdded: string;
    linesRemoved: string;
    linesModified: string;
  };
  buttons: {
    clear: string;
    copied: string;
    download: string;
  };
  tooltips: {
    closePanelLeft: string;
    closePanelRight: string;
    showModifiedCode: string;
    normalPro: string;
    dualScroll: string;
    changeLanguage: string;
    sponsor: string;
  };
  messages: {
    noChangesFound: string;
    comparisonCompleted: string;
    pleaseEnterCode: string;
    codeSaved: string;
    saveFailed: string;
    editorNotInitialized: string;
  };
}

type SupportedLanguage = 'en' | 'es' | 'pt' | 'zh';

class I18nService {
  private currentLanguage: SupportedLanguage = 'en';
  private translations: Map<SupportedLanguage, Translations> = new Map();
  private fallbackLanguage: SupportedLanguage = 'en';

  constructor() {
    this.detectLanguage();
    this.loadTranslations();
  }

  /**
   * Detect user's preferred language from VS Code or browser
   */
  private detectLanguage(): void {
    try {
      // Try to get VS Code language first
      const vscodeLocale = (window as any).vscode?.env?.language;
      if (vscodeLocale) {
        this.currentLanguage = this.mapLanguageCode(vscodeLocale);
        return;
      }

      // Fallback to browser language
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      this.currentLanguage = this.mapLanguageCode(browserLang);
    } catch (error) {
      console.warn('Could not detect language, using English as default:', error);
      this.currentLanguage = 'en';
    }
  }

  /**
   * Map language codes to supported languages
   */
  private mapLanguageCode(langCode: string): SupportedLanguage {
    const code = langCode.toLowerCase().split('-')[0];
    
    switch (code) {
      case 'es': return 'es';
      case 'pt': return 'pt';
      case 'zh': return 'zh';
      case 'en':
      default: return 'en';
    }
  }

  /**
   * Load all translation files
   */
  private async loadTranslations(): Promise<void> {
    const languages: SupportedLanguage[] = ['en', 'es', 'pt', 'zh'];
    
    for (const lang of languages) {
      try {
        // In webview context, we'll need to load these differently
        // For now, we'll embed them directly
        const translations = await this.loadLanguageFile(lang);
        this.translations.set(lang, translations);
      } catch (error) {
        console.warn(`Failed to load translations for ${lang}:`, error);
      }
    }

    // Initialize UI with current language
    this.updateUI();
  }

  /**
   * Load individual language file
   * Note: In webview, we'll need to embed these or load via message passing
   */
  private async loadLanguageFile(lang: SupportedLanguage): Promise<Translations> {
    // For now, we'll embed the translations directly
    // Later we can optimize this to load from JSON files
    const embeddedTranslations = this.getEmbeddedTranslations();
    return embeddedTranslations[lang] || embeddedTranslations.en;
  }

  /**
   * Get embedded translations (temporary solution)
   * TODO: Replace with dynamic loading from JSON files
   */
  private getEmbeddedTranslations(): Record<SupportedLanguage, Translations> {
    return {
      en: {
        stats: {
          changes: "Changes",
          similar: "Similar",
          linesAdded: "lines added",
          linesRemoved: "lines removed",
          linesModified: "lines modified"
        },
        buttons: {
          clear: "Clear",
          copied: "Copied!",
          download: "Download"
        },
        tooltips: {
          closePanelLeft: "Close/Open panel LEFT",
          closePanelRight: "Close/Open panel RIGHT",
          showModifiedCode: "Show modified code",
          normalPro: "Normal/Pro",
          dualScroll: "Dual scroll",
          changeLanguage: "Change language",
          sponsor: "Sponsor"
        },
        messages: {
          noChangesFound: "No differences found between the two code blocks",
          comparisonCompleted: "Comparison completed: {0} total changes found",
          pleaseEnterCode: "Please enter code in at least one field",
          codeSaved: "Code from {0} panel saved to Downloads!",
          saveFailed: "Failed to save code: {0}",
          editorNotInitialized: "Editor manager not initialized"
        }
      },
      es: {
        stats: {
          changes: "Cambios",
          similar: "Similar",
          linesAdded: "líneas agregadas",
          linesRemoved: "líneas eliminadas",
          linesModified: "líneas modificadas"
        },
        buttons: {
          clear: "Limpiar",
          copied: "¡Copiado!",
          download: "Descargar"
        },
        tooltips: {
          closePanelLeft: "Cerrar/Abrir panel IZQUIERDO",
          closePanelRight: "Cerrar/Abrir panel DERECHO",
          showModifiedCode: "Mostrar código modificado",
          normalPro: "Normal/Pro",
          dualScroll: "Desplazamiento dual",
          changeLanguage: "Cambiar idioma",
          sponsor: "Patrocinar"
        },
        messages: {
          noChangesFound: "No se encontraron diferencias entre los dos bloques de código",
          comparisonCompleted: "Comparación completada: {0} cambios totales encontrados",
          pleaseEnterCode: "Por favor ingresa código en al menos un campo",
          codeSaved: "¡Código del panel {0} guardado en Descargas!",
          saveFailed: "Error al guardar código: {0}",
          editorNotInitialized: "Editor no inicializado"
        }
      },
      pt: {
        stats: {
          changes: "Alterações",
          similar: "Similar",
          linesAdded: "linhas adicionadas",
          linesRemoved: "linhas removidas",
          linesModified: "linhas modificadas"
        },
        buttons: {
          clear: "Limpar",
          copied: "Copiado!",
          download: "Baixar"
        },
        tooltips: {
          closePanelLeft: "Fechar/Abrir painel ESQUERDO",
          closePanelRight: "Fechar/Abrir painel DIREITO",
          showModifiedCode: "Mostrar código modificado",
          normalPro: "Normal/Pro",
          dualScroll: "Rolagem dupla",
          changeLanguage: "Alterar idioma",
          sponsor: "Patrocinar"
        },
        messages: {
          noChangesFound: "Nenhuma diferença encontrada entre os dois blocos de código",
          comparisonCompleted: "Comparação concluída: {0} alterações totais encontradas",
          pleaseEnterCode: "Por favor, insira código em pelo menos um campo",
          codeSaved: "Código do painel {0} salvo em Downloads!",
          saveFailed: "Falha ao salvar código: {0}",
          editorNotInitialized: "Editor não inicializado"
        }
      },
      zh: {
        stats: {
          changes: "更改",
          similar: "相似",
          linesAdded: "行已添加",
          linesRemoved: "行已删除",
          linesModified: "行已修改"
        },
        buttons: {
          clear: "清除",
          copied: "已复制！",
          download: "下载"
        },
        tooltips: {
          closePanelLeft: "关闭/打开左侧面板",
          closePanelRight: "关闭/打开右侧面板",
          showModifiedCode: "显示修改的代码",
          normalPro: "普通/专业",
          dualScroll: "双重滚动",
          changeLanguage: "更改语言",
          sponsor: "赞助"
        },
        messages: {
          noChangesFound: "两个代码块之间未发现差异",
          comparisonCompleted: "比较完成：发现 {0} 个总更改",
          pleaseEnterCode: "请在至少一个字段中输入代码",
          codeSaved: "{0} 面板的代码已保存到下载文件夹！",
          saveFailed: "保存代码失败：{0}",
          editorNotInitialized: "编辑器管理器未初始化"
        }
      }
    };
  }

  /**
   * Get translated text by key path
   */
  public t(keyPath: string, ...args: string[]): string {
    try {
      const translations = this.translations.get(this.currentLanguage) || 
                          this.translations.get(this.fallbackLanguage);
      
      if (!translations) {
        console.warn(`No translations found for ${this.currentLanguage}`);
        return keyPath;
      }

      // Navigate through nested object using dot notation
      const keys = keyPath.split('.');
      let value: any = translations;
      
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }

      if (typeof value !== 'string') {
        console.warn(`Translation not found for key: ${keyPath}`);
        return keyPath;
      }

      // Replace placeholders {0}, {1}, etc.
      return this.interpolate(value, args);
    } catch (error) {
      console.error(`Error getting translation for ${keyPath}:`, error);
      return keyPath;
    }
  }

  /**
   * Replace placeholders in translated strings
   */
  private interpolate(text: string, args: string[]): string {
    return text.replace(/\{(\d+)\}/g, (match, index) => {
      const argIndex = parseInt(index, 10);
      return args[argIndex] !== undefined ? args[argIndex] : match;
    });
  }

  /**
   * Change current language
   */
  public setLanguage(language: SupportedLanguage): void {
    if (this.translations.has(language)) {
      this.currentLanguage = language;
      this.updateUI();
      
      // Save preference
      try {
        localStorage.setItem('compareCode.language', language);
      } catch (error) {
        console.warn('Could not save language preference:', error);
      }
    } else {
      console.warn(`Language ${language} not supported`);
    }
  }

  /**
   * Get current language
   */
  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  public getAvailableLanguages(): SupportedLanguage[] {
    return Array.from(this.translations.keys());
  }

  /**
   * Update UI with current language
   */
  private updateUI(): void {
    // Update all elements with data-i18n attributes
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translatedText = this.t(key);
        
        // Update text content or specific attributes
        const attr = element.getAttribute('data-i18n-attr');
        if (attr) {
          element.setAttribute(attr, translatedText);
        } else {
          element.textContent = translatedText;
        }
      }
    });

    // Trigger custom event for other components to react
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: this.currentLanguage }
    }));
  }

  /**
   * Initialize i18n service
   */
  public init(): void {
    // Load saved language preference
    try {
      const savedLang = localStorage.getItem('compareCode.language') as SupportedLanguage;
      if (savedLang && this.translations.has(savedLang)) {
        this.currentLanguage = savedLang;
      }
    } catch (error) {
      console.warn('Could not load language preference:', error);
    }

    // Update UI when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.updateUI());
    } else {
      this.updateUI();
    }
  }
}

// Create global instance
const i18n = new I18nService();

// Export for use in other modules
export { i18n, I18nService };
export type { SupportedLanguage, Translations };

// Make available globally for HTML usage
(window as any).i18n = i18n;