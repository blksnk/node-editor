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
