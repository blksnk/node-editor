export const cssVar = (s: string) => `var(--${s})`;

export const cssValue = (s: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--${s}`);

export const cssClass = (c: string) => `.${c}`;

export const cssId = (c: string) => `#${c}`;

export const normalizeCssClass = (s: string) => s.replaceAll(' ', '__');
