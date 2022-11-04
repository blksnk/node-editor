export const cssVar = (s: string) => `var(--${s})`;

export const cssValue = (s: string) =>
  getComputedStyle(document.documentElement)
  .getPropertyValue(`--${s}`); // #999999