export const element = <T extends HTMLElement>(tagName: string): T =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  document.createElement(tagName);

export const svgElement = <T extends SVGElement>(tagName: string) =>
  document.createElementNS('http://www.w3.org/2000/svg', tagName) as T;
