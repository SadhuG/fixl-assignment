import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Our type scale (index.css) uses custom names; without this, tailwind-merge reads `text-body`
// as a text colour and drops the real colour class it conflicts with (e.g. text-primary-foreground).
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['display', 'h1', 'h2', 'body', 'small', 'micro'],
      radius: ['badge', 'control', 'card', 'panel', 'modal'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
