import type { Variants, Transition } from 'motion/react';

// Apple-grade physical easing: gentle deceleration, no bounce
export const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT = [0, 0, 0.2, 1] as const;

export const transitionFast: Transition = {
  duration: 0.18,
  ease: EASE_EDITORIAL,
};

export const transitionNormal: Transition = {
  duration: 0.28,
  ease: EASE_EDITORIAL,
};

export const transitionSlow: Transition = {
  duration: 0.42,
  ease: EASE_EDITORIAL,
};

export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: EASE_EDITORIAL,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.16,
      ease: EASE_OUT,
    },
  },
};

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: EASE_EDITORIAL,
    },
  },
};

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.24,
      ease: EASE_EDITORIAL,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const slideDrawerVariants: Variants = {
  closed: {
    x: '100%',
    transition: {
      duration: 0.24,
      ease: EASE_EDITORIAL,
    },
  },
  open: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: EASE_EDITORIAL,
    },
  },
};

export const softScaleVariants: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.94 },
};
