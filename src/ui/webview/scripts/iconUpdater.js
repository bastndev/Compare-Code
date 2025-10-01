/* ======================================
   DYNAMIC ICON UPDATER - VS Code Extension | MARK: ICONS
   ======================================= */

(function () {
  'use strict';

  const iconSelectors = {
    
    // Main icons
    WARNING_ICON: 'img.warning-icon',
    PLAY_ICON: '.btn-play img',
    STOP_ICON: '.btn-play img',
    PANEL_LEFT_ICON: '.btn-panel-left img',
    PANEL_RIGHT_ICON: '.btn-panel-right img',

    // Bottom bar icons
    DUAL_SCROLL_ICON: '.dual-scroll img.icon',
    LANGUAGE_ICON: '.language img.icon',
    ONLY_CODE_ICON: '.only-code img.icon',
    SWITCH_ON_ICON: '.switch-on-off img.icon',
    SWITCH_OFF_ICON: '.switch-on-off img.icon',
    EARTH_CODE_ICON: '.sponsor img.icon',
    
    // Utility icons (multiple instances)
    CLEAR_ICON_L: '.options-panel-left .clear-code img',
    CLEAR_ICON_R: '.options-panel-right .clear-code img',
    COPY_ICON_L: '.options-panel-left .copy-code img',
    COPY_ICON_R: '.options-panel-right .copy-code img',
    DOWNLOAD_ICON_L: '.options-panel-left .download-code img',
    DOWNLOAD_ICON_R: '.options-panel-right .download-code img',
  };

  // ======================================
  // Icon Management | MARK: UPDATE
  // ======================================

  function updateAllIcons(icons) {
    console.log('Updating icons with new theme...', icons);

    updateIcon(iconSelectors.WARNING_ICON, icons.warning);
    updateIcon(iconSelectors.PLAY_ICON, icons.play);
    updateIcon(iconSelectors.PANEL_LEFT_ICON, icons.panelLeft);
    updateIcon(iconSelectors.PANEL_RIGHT_ICON, icons.panelRight);

    updateIcon(iconSelectors.DUAL_SCROLL_ICON, icons.dualScroll);
    updateIcon(iconSelectors.LANGUAGE_ICON, icons.language);
    updateIcon(iconSelectors.ONLY_CODE_ICON, icons.onlyCode);
    updateIcon(iconSelectors.SWITCH_ON_ICON, icons.switchOn);
    updateIcon(iconSelectors.EARTH_CODE_ICON, icons.earthCode);

    updateIcon(iconSelectors.CLEAR_ICON_L, icons.clear);
    updateIcon(iconSelectors.CLEAR_ICON_R, icons.clear);
    updateIcon(iconSelectors.COPY_ICON_L, icons.copy);
    updateIcon(iconSelectors.COPY_ICON_R, icons.copy);
    updateIcon(iconSelectors.DOWNLOAD_ICON_L, icons.download);
    updateIcon(iconSelectors.DOWNLOAD_ICON_R, icons.download);
  }

  function updateIcon(selector, newSrc) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element && element.tagName === 'IMG') {
        element.src = newSrc;
      }
    });
  }

  // ======================================
  // Message Handling | MARK: MESSAGES
  // ======================================

  function setupMessageListener() {
    window.addEventListener('message', (event) => {
      const message = event.data;

      switch (message.command) {
        case 'updateIcons':
          updateAllIcons(message.icons);
          break;
        default:
          break;
      }
    });
  }

  function init() {
    setupMessageListener();
    console.log(
      'Dynamic icon updater initialized - icons will change automatically with VSCode theme'
    );
  }

  // ======================================
  // Initialization | MARK: INIT
  // ======================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ======================================
  // Global API | MARK: API
  // ======================================

  window.iconUpdater = {
    updateAllIcons: updateAllIcons,
    updateIcon: updateIcon,
  };

  console.log('Icon updater service loaded and ready');
})();
