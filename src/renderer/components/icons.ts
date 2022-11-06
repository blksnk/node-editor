import { svgElement } from '../../utils/document';
import { cssValue } from '../../utils/css';
import { resizeSvg } from '../connection';
import { cssSelectors } from './cssSelectors';

const IconNames = ['help'];

type IconName = typeof IconNames[number];

interface IconDefinition {
  d: string;
  height: number;
  width: number;
  color: string;
  className: string;
}

const iconPaths = {
  help: {
    d: 'M12 3C7.03125 3 3 7.03125 3 12C3 16.9688 7.03125 21 12 21C16.9688 21 21 16.9688 21 12C21 7.03125 16.9688 3 12 3ZM11.7188 17.25C11.5333 17.25 11.3521 17.195 11.1979 17.092C11.0437 16.989 10.9236 16.8426 10.8526 16.6713C10.7817 16.5 10.7631 16.3115 10.7993 16.1296C10.8354 15.9477 10.9247 15.7807 11.0558 15.6496C11.1869 15.5185 11.354 15.4292 11.5359 15.393C11.7177 15.3568 11.9062 15.3754 12.0775 15.4464C12.2488 15.5173 12.3952 15.6375 12.4983 15.7917C12.6013 15.9458 12.6562 16.1271 12.6562 16.3125C12.6562 16.5611 12.5575 16.7996 12.3817 16.9754C12.2058 17.1512 11.9674 17.25 11.7188 17.25ZM13.2863 12.4688C12.5264 12.9788 12.4219 13.4461 12.4219 13.875C12.4219 14.049 12.3527 14.216 12.2297 14.339C12.1066 14.4621 11.9397 14.5312 11.7656 14.5312C11.5916 14.5312 11.4247 14.4621 11.3016 14.339C11.1785 14.216 11.1094 14.049 11.1094 13.875C11.1094 12.848 11.5819 12.0314 12.5541 11.3784C13.4578 10.7719 13.9688 10.3875 13.9688 9.54234C13.9688 8.96766 13.6406 8.53125 12.9614 8.20828C12.8016 8.13234 12.4458 8.05828 12.008 8.06344C11.4586 8.07047 11.032 8.20172 10.7034 8.46609C10.0837 8.96484 10.0312 9.50766 10.0312 9.51562C10.0271 9.60181 10.006 9.68632 9.96919 9.76435C9.93237 9.84238 9.88054 9.9124 9.81667 9.9704C9.75279 10.0284 9.67811 10.0732 9.5969 10.1024C9.51569 10.1315 9.42954 10.1444 9.34336 10.1402C9.25718 10.1361 9.17266 10.115 9.09463 10.0782C9.0166 10.0414 8.94659 9.98953 8.88859 9.92565C8.83059 9.86177 8.78574 9.7871 8.7566 9.70589C8.72745 9.62468 8.71459 9.53852 8.71875 9.45234C8.72391 9.33844 8.80313 8.31234 9.87984 7.44609C10.4381 6.99703 11.1483 6.76359 11.9892 6.75328C12.5845 6.74625 13.1437 6.84703 13.523 7.02609C14.6578 7.56281 15.2812 8.45766 15.2812 9.54234C15.2812 11.1281 14.2214 11.8402 13.2863 12.4688Z',
    height: 24,
    width: 24,
    color: cssValue('white'),
    className: cssSelectors.ui.icons.help,
  },
} as {
  [k: IconName]: IconDefinition;
};

interface IconOptions {
  color?: string;
  opacity?: number;
  className?: string;
  width?: number;
  height?: number;
}

export const Icon = (kind: IconName, options: IconOptions = {}) => {
  const icon = iconPaths[kind];
  const color = options.color ?? icon.color;
  const opacity = options.opacity ?? 1;
  const size = {
    width: options.width ?? icon.width,
    height: options.height ?? icon.height,
  };
  const classes = [cssSelectors.ui.icon, icon.className];
  if (options.className) {
    classes.push(options.className);
  }
  const svg = svgElement<SVGSVGElement>('svg');
  resizeSvg(svg, size);
  svg.classList.add(...classes);
  const path = svgElement<SVGPathElement>('path');
  path.setAttribute('d', icon.d);
  path.setAttribute('fill', color);
  path.setAttribute('fill-opacity', String(opacity));
  svg.appendChild(path);
  return svg;
};