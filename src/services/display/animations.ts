// ================================== 
// Button animation | MARK: CONFETTI 
// ==================================

/**
 * Launch confetti animation from a specific position
 */
function launchConfetti(x: number, y: number): void {
    const COLORS: readonly string[] = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7',
        '#a29bfe', '#fd79a8', '#fdcb6e', '#00d2d3', '#ff9ff3',
    ];
    const CONFETTI_COUNT = 160;

    for (let i = 0; i < CONFETTI_COUNT; i++) {
        const confetti = createConfettiElement(x, y, COLORS);
        document.body.appendChild(confetti);
        animateConfetti(confetti, x, y);
    }
}

/**
 * Create a single confetti element with random properties
 */
function createConfettiElement(
    x: number, 
    y: number, 
    colors: readonly string[]
): HTMLDivElement {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    // Random size
    const size = Math.random() * 5 + 3;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;

    // Random color
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];

    // Random shape (circle or square)
    if (Math.random() > 0.5) {
        confetti.style.borderRadius = '50%';
    }

    // Initial position
    confetti.style.left = `${x}px`;
    confetti.style.top = `${y}px`;

    return confetti;
}

/**
 * Animate a single confetti element with physics
 */
function animateConfetti(
    confetti: HTMLDivElement,
    _startX: number,
    startY: number
): void {
    const physics = initializePhysics();
    let position = { x: 0, y: 0 };
    let visual = { opacity: 1, scale: 1, rotation: Math.random() * 360 };

    function update(): void {
        updatePhysics(physics);
        position = updatePosition(position, physics);
        visual = updateVisual(visual, position, startY, physics);

        applyTransform(confetti, position, visual);

        if (shouldContinueAnimation(visual, position, startY)) {
            requestAnimationFrame(update);
        } else {
            confetti.remove();
        }
    }

    update();
}

/**
 * Initialize physics properties for confetti
 */
function initializePhysics() {
    const angle = Math.PI / 2 + (Math.random() - 0.5) * 1.4;
    const velocity = Math.random() * 3 + 4;

    return {
        vx: Math.cos(angle) * velocity * 0.7,
        vy: Math.sin(angle) * velocity,
        rotationSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.2,
        friction: 0.98,
        airResistance: 0.995,
    };
}

/**
 * Update physics values (velocity and rotation)
 */
function updatePhysics(physics: ReturnType<typeof initializePhysics>): void {
    physics.vy += physics.gravity;
    physics.vx *= physics.airResistance;
    physics.vy *= physics.friction;
    physics.rotationSpeed *= 0.98;
}

/**
 * Update confetti position with wobble effect
 */
function updatePosition(
    position: { x: number; y: number },
    physics: ReturnType<typeof initializePhysics>
): { x: number; y: number } {
    const wobble = Math.sin(position.y * 0.1) * 1.5;
    
    return {
        x: position.x + physics.vx + wobble * 0.1,
        y: position.y + physics.vy,
    };
}

/**
 * Update visual properties (opacity, scale, rotation)
 */
function updateVisual(
    visual: { opacity: number; scale: number; rotation: number },
    position: { x: number; y: number },
    startY: number,
    physics: ReturnType<typeof initializePhysics>
): { opacity: number; scale: number; rotation: number } {
    let { opacity, scale, rotation } = visual;

    // Fade out near the end
    if (position.y > window.innerHeight * 0.6 - startY) {
        opacity -= 0.015;
        scale -= 0.01;
    }

    rotation += physics.rotationSpeed;

    return { opacity, scale, rotation };
}

/**
 * Apply transform and opacity to confetti element
 */
function applyTransform(
    confetti: HTMLDivElement,
    position: { x: number; y: number },
    visual: { opacity: number; scale: number; rotation: number }
): void {
    confetti.style.transform = 
        `translate(${position.x}px, ${position.y}px) rotate(${visual.rotation}deg) scale(${visual.scale})`;
    confetti.style.opacity = visual.opacity.toString();
}

/**
 * Determine if animation should continue
 */
function shouldContinueAnimation(
    visual: { opacity: number },
    position: { x: number; y: number },
    startY: number
): boolean {
    return visual.opacity > 0 && position.y < window.innerHeight * 2;
}

/**
 * Get button center coordinates
 */
function getButtonCenter(button: HTMLElement): { x: number; y: number } {
    const rect = button.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
}

/**
 * Trigger confetti animation for perfect match
 */
export function triggerPerfectMatchConfetti(): void {
    const btn = document.getElementById('playBtn');

    if (!btn) {
        console.error('Play button not found');
        return;
    }

    const center = getButtonCenter(btn);
    launchConfetti(center.x, center.y);
}

/**
 * Initialize confetti animation system (no automatic triggers)
 */
export function initializeConfetti(): void {
    // Confetti is now triggered manually via triggerPerfectMatchConfetti()
    // when comparison shows 100% similarity
}