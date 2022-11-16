export const element = <T extends HTMLElement>(
  tagName: string,
  ...classNames: string[]
): T => {
  const el = document.createElement(tagName);
  el.classList.add(...classNames);
  return el as T;
};

export const svgElement = <T extends SVGElement>(
  tagName: string,
  ...classNames: string[]
) => {
  const el = document.createElementNS(
    'http://www.w3.org/2000/svg',
    tagName,
  ) as T;
  el.classList.add(...classNames);
  return el;
};

export const elementWithChildren = <T extends HTMLElement>(
  tagName: string,
  children: HTMLElement[] = [],
  ...classNames: string[]
): T => {
  const el = element<T>(tagName, ...classNames);
  el.append(...children);
  return el;
};

type HTMLElementConstructor<T extends HTMLElement> = (
  children: HTMLElement[],
  ...classNames: string[]
) => T;

export const UL: HTMLElementConstructor<HTMLUListElement> = (
  children = [],
  ...classNames
) => elementWithChildren<HTMLUListElement>('ul', children, ...classNames);

export const LI: HTMLElementConstructor<HTMLLIElement> = (
  children = [],
  ...classNames
) => elementWithChildren<HTMLLIElement>('li', children, ...classNames);

export const DIV: HTMLElementConstructor<HTMLDivElement> = (
  children = [],
  ...classNames
) => elementWithChildren<HTMLDivElement>('div', children, ...classNames);

export const ARTICLE: HTMLElementConstructor<HTMLElement> = (
  children = [],
  ...classNames
) => elementWithChildren<HTMLElement>('article', children, ...classNames);

export const HEADING = (
  size: 1 | 2 | 3 | 4 | 5 | 6,
  children = [],
  ...classNames: string[]
) =>
  elementWithChildren<HTMLHeadingElement>(`h${size}`, children, ...classNames);

export const SPAN: HTMLElementConstructor<HTMLSpanElement> = (
  children = [],
  ...classNames
) => elementWithChildren<HTMLSpanElement>('span', children, ...classNames);
