// src/lib/motionPresets.ts

import type { Transition, Variants } from 'motion/react';

export const SPRING_TACTILE: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 28,
  mass: 0.7,
};

export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 440,
  damping: 30,
  mass: 0.8,
};

export const SPRING_BOUNCY: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 16,
  mass: 0.9,
};

export const SPRING_SHEET: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 32,
};

export const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.045,
    },
  },
};

export const STAGGER_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
