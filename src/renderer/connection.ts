import {
  LineCommandFunction,
  RendererConnection,
  RendererNode,
  Vec2,
} from './renderer.types';
import { findById, getSingleType, isDefined } from '../utils/data';
import { vecDelta } from '../utils/vectors';
import {
  DefinedIOTypeName,
  IOTypeName,
  IOTypeNames,
  NodeWithId,
} from '../node/node.types';

import { cssVar } from '../utils/css';
import { NodeConnection } from '../runtime/runtime.types';
import { svgElement } from '../utils/document';

export const createConnectionSvg = () => {
  const svg = svgElement<SVGSVGElement>('svg');
  resizeSvg(svg);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
  svg.classList.add('node__connection__root');
  // create group to wrap all paths in
  const defs = svgElement<SVGDefsElement>('defs');
  createAllConnectionGradients(defs);
  svg.appendChild(defs);
  const pathsGroup = svgElement<SVGGElement>('g');
  const pendingConnectionGroup = svgElement<SVGGElement>('g');
  pathsGroup.id = 'node__connection__paths';
  pendingConnectionGroup.id = 'node__connection__pending';
  svg.append(pathsGroup, pendingConnectionGroup);
  return svg;
};

type GradientColor = IOTypeName | 'white';

const gradientId = (inputColor: GradientColor, outputColor: GradientColor) =>
  `gradient__${inputColor}__${outputColor}`;

const createConnectionGradient = (
  inputColor: GradientColor,
  outputColor: GradientColor,
) => {
  const gradient = svgElement<SVGLinearGradientElement>('linearGradient');
  const stop0 = svgElement<SVGStopElement>('stop');
  const stop1 = svgElement<SVGStopElement>('stop');
  stop0.setAttribute('offset', '5%');
  stop1.setAttribute('offset', '95%');
  stop0.setAttribute('stop-color', cssVar(inputColor));
  stop1.setAttribute('stop-color', cssVar(outputColor));
  gradient.append(stop0, stop1);
  // set unique id for gradient combination
  gradient.id = gradientId(inputColor, outputColor);
  return gradient;
};

const createAllConnectionGradients = (defs: SVGDefsElement) => {
  // create all color combinations
  const gradients = [];
  const types: GradientColor[] = [...IOTypeNames, 'white'];
  for (let i = 0; i < types.length; i++) {
    for (let j = 0; j < types.length; j++) {
      const startColor = types[i];
      const endColor = types[j];
      gradients.push(createConnectionGradient(startColor, endColor));
    }
  }
  defs.append(...gradients);
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

export const getUniqueConnections = (nodes: NodeWithId[]): NodeConnection[] => {
  return nodes
    .map((node) =>
      node.inputs.map((input) => {
        const outputNodeConnections = input.connection.connections.map((c) => {
          const node = findById(nodes, c.node.id as number);
          if (node === undefined) return undefined;
          const outputNode = findById(node.outputs, c.ioId);
          if (outputNode === undefined) return undefined;
          return {
            ioId: c.ioId,
            node,
            type: outputNode.type,
          };
        });
        const filteredOutputNodeConnections = outputNodeConnections.filter(
          (c) => isDefined(c),
        ) as {
          ioId: number;
          node: NodeWithId;
          type: DefinedIOTypeName;
        }[];
        if (filteredOutputNodeConnections.length === 0) return undefined;

        return filteredOutputNodeConnections.map((c) => ({
          inputNode: {
            node,
            ioId: input.id,
            type: input.type,
          },
          outputNode: c,
        }));
      }),
    )
    .flat(2)
    .filter((connection) => connection !== undefined)
    .map((c, index) => ({
      ...c,
      id: index,
    })) as NodeConnection[];
};

export const assignIoPositions = (
  connections: NodeConnection[],
  rendererNodes: RendererNode[],
): RendererConnection[] => {
  return connections
    .map((c) => {
      const inputNode = findById(rendererNodes, c.inputNode.node.id);
      const outputNode = findById(rendererNodes, c.outputNode.node.id);
      if (!inputNode || !outputNode) return undefined;
      const outputPosition = getIOIndicatorPosition(
        outputNode.io.outputs[c.outputNode.ioId],
      );
      const inputPosition = getIOIndicatorPosition(
        inputNode.io.inputs[c.inputNode.ioId],
      );
      return {
        inputNode: {
          id: c.inputNode.node.id,
          ioId: c.inputNode.ioId,
          type: c.inputNode.type,
          position: inputPosition,
        },
        outputNode: {
          id: c.outputNode.node.id,
          ioId: c.outputNode.ioId,
          type: c.outputNode.type,
          position: outputPosition,
        },
      };
    })
    .filter((connection) => connection !== undefined) as RendererConnection[];
};

export const getIOIndicatorPosition = (ioRow: HTMLLIElement): Vec2 => {
  const indicator = ioRow.querySelector(
    '.node__io__indicator',
  ) as HTMLDivElement;
  const { x, width, height, y } = indicator.getBoundingClientRect();
  return {
    x: x + width / 2,
    y: y + height / 2,
  };
};

const svgPath = (
  points: Vec2[],
  command: LineCommandFunction,
  gradient = gradientId('white', 'white'),
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

export const getConnectionGradientId = (connection: RendererConnection) => {
  return gradientId(
    getSingleType(connection.outputNode.type),
    getSingleType(connection.inputNode.type),
  );
};

export const renderConnections = (
  connections: RendererConnection[],
  svg: SVGSVGElement,
) => {
  const paths = connections.map((c) =>
    svgPath(
      [c.outputNode.position, c.inputNode.position],
      svgBezierCommand(0.35),
      getConnectionGradientId(c),
    ),
  );
  const pathsGroup = svg.querySelector('#node__connection__paths');

  if (pathsGroup) {
    if (paths.length > 0) {
      pathsGroup.replaceChildren(...paths);
    } else {
      pathsGroup.replaceChildren();
    }
  }
};

export const renderPendingConnection = (
  startPos: Vec2,
  endPos: Vec2,
  color: GradientColor,
  svg: SVGSVGElement,
) => {
  const pendingConnectionGroup = svg.querySelector(
    '#node__connection__pending',
  );
  const path = svgPath(
    [startPos, endPos],
    svgBezierCommand(0.35),
    gradientId(color, color),
  );
  !!pendingConnectionGroup && pendingConnectionGroup.replaceChildren(path);
};

export const clearPendingConnection = (svg: SVGSVGElement) => {
  const pendingConnectionGroup = svg.querySelector(
    '#node__connection__pending',
  );
  !!pendingConnectionGroup && pendingConnectionGroup.replaceChildren();
};
