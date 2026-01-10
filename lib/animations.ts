// Animation constants and helpers for NGINE
// All timings follow: 120ms - 280ms rule

export const ANIMATION_TIMINGS = {
  fast: 120,
  normal: 200,
  slow: 280,
  micro: 80,
} as const

export const ANIMATION_EASING = {
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  easeInOut: 'ease-in-out',
} as const

// Spring configs for natural feel
export const SPRING_CONFIG = {
  gentle: {
    damping: 15,
    stiffness: 150,
  },
  bouncy: {
    damping: 10,
    stiffness: 200,
  },
  smooth: {
    damping: 20,
    stiffness: 100,
  },
} as const

// Scale values for interactions
export const SCALE = {
  pressed: 0.94,
  hover: 1.02,
  pop: 1.08,
  breathing: {
    min: 1,
    max: 1.01,
  },
} as const

// Opacity values
export const OPACITY = {
  disabled: 0.4,
  dimmed: 0.6,
  normal: 1,
} as const


