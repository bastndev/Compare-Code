// ======================================
// PERFECT MATCH EFFECT | MARK: EFFECT
// ======================================

/**
 * Animation timing configuration (must match SCSS animation durations)
 */
export const MATCH_EFFECT_CONFIG = {
  /** Total duration before hiding effect (ms) */
  HIDE_DELAY: 3000,
  /** Animation duration in SCSS (for reference) */
  ANIMATION_DURATION: 2000,
} as const;

/**
 * Helper function to get both effect elements
 */
function getEffectElements(): [HTMLElement | null, HTMLElement | null] {
  return [
    document.getElementById('effect1'),
    document.getElementById('effect2'),
  ];
}

/**
 * Show the perfect match effect overlay on both panels
 */
export function showPerfectMatchEffect(): void {
  const [effect1, effect2] = getEffectElements();
  
  effect1?.classList.add('active');
  effect2?.classList.add('active');
}

/**
 * Hide the perfect match effect overlay from both panels
 */
export function hidePerfectMatchEffect(): void {
  const [effect1, effect2] = getEffectElements();
  
  effect1?.classList.remove('active');
  effect2?.classList.remove('active');
}
