import { svgElement } from '../utils/document';
import { cssSelectors } from '../ui/cssSelectors';
import { createAllConnectionGradients } from './connection';
import { LineCommandFunction, Vec2 } from './renderer.types';
import { vecDelta } from '../utils/vectors';

export const createRendererSvg = () => {
  // generate svg gradients
  const defs = svgElement<SVGDefsElement>('defs');
  createAllConnectionGradients(defs);
  // create groups to wrap all paths
  const pathsGroup = svgElement<SVGGElement>('g');
  const pendingConnectionGroup = svgElement<SVGGElement>('g');
  pathsGroup.id = cssSelectors.renderer.connections.paths;
  pendingConnectionGroup.id = cssSelectors.renderer.connections.pending;
  // create and resize svg to wrap all elements
  const svg = svgElement<SVGSVGElement>(
    'svg',
    cssSelectors.renderer.connections.root,
  );
  resizeSvg(svg);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
  svg.append(defs, pathsGroup, pendingConnectionGroup);
  return svg;
};

export const resizeSvg = (
  svg: SVGSVGElement,
  size: { width: number; height: number } = {
    width: window.innerWidth,
    height: window.innerHeight,
  },
) => {
  svg.style.width = size.width + 'px';
  svg.style.height = size.height + 'px';
  svg.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
};

export const svgPath = (
  points: Vec2[],
  command: LineCommandFunction,
  gradient = cssSelectors.renderer.connections.gradientId('any', 'any'),
) => {
  // build the d attributes by looping over the points
  const d = points.reduce(
    (acc, point, i, a) =>
      i === 0
        ? // if first point
        `M${point.x.toFixed(1)} ${point.y.toFixed(1)}`
        : // else
        `${acc} ${command(point, i, a)}`,
    '',
  );
  const path = svgElement<SVGPathElement>('path');
  path.setAttribute('d', d);
  path.setAttribute('stroke', `url('#${gradient}')`);
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  return path;
};

// export const svgLineCommand = (point: Vec2) => `L${point.x.toFixed(1)} ${point.y.toFixed(1)}`

export const svgBezierCommand =
  (smooth = 0.5) =>
    (point: Vec2, index: number, points: Vec2[]) => {
      const prevPoint = points[index - 1];

      // invert smooth factor
      const s = 1 - smooth;

      // generate control points for Bézier curve between 2 points
      const delta = vecDelta(point, prevPoint);
      const startAnchor = {
        x: prevPoint.x + delta.x * s,
        y: prevPoint.y,
      };
      const endAnchor = {
        x: point.x - delta.x * s,
        y: point.y,
      };
      return `C${startAnchor.x},${startAnchor.y} ${endAnchor.x},${endAnchor.y} ${point.x},${point.y}`;
    };
