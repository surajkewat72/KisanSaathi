/**
 * Shared Framer Motion animation variants.
 * Import and use in any component for consistent, minimal animations.
 */

// ── Entrance variants ──────────────────────────────────────────────────────────
export const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.45, delay: i * 0.1, ease: 'easeOut' },
    }),
};

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: (i = 0) => ({
        opacity: 1,
        transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
    }),
};

export const slideUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
    }),
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
        opacity: 1, scale: 1,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

// ── Stagger container ──────────────────────────────────────────────────────────
export const staggerContainer = (stagger = 0.1) => ({
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
});

// ── Hover / tap effects ────────────────────────────────────────────────────────
export const hoverCard = {
    scale: 1.015,
    transition: { duration: 0.2, ease: 'easeOut' },
};

export const hoverLift = {
    y: -3,
    scale: 1.01,
    transition: { duration: 0.2, ease: 'easeOut' },
};

export const tapScale = { scale: 0.97 };
