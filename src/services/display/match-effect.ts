// ======================================
// PERFECT MATCH EFFECT | MARK: EFFECT
// ======================================

/**
 * Show the perfect match effect overlay
 */
export function showPerfectMatchEffect(): void {
  const effect1 = document.getElementById('effect1');
  const effect2 = document.getElementById('effect2');
  
  console.log('showPerfectMatchEffect called');
  console.log('effect1:', effect1);
  console.log('effect2:', effect2);
  
  if (effect1) {
    effect1.classList.add('active');
  }
  if (effect2) {
    effect2.classList.add('active');
  }
}

/**
 * Hide the perfect match effect overlay
 */
export function hidePerfectMatchEffect(): void {
  const effect1 = document.getElementById('effect1');
  const effect2 = document.getElementById('effect2');
  
  if (effect1) {
    effect1.classList.remove('active');
  }
  if (effect2) {
    effect2.classList.remove('active');
  }
}
