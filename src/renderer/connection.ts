import { RendererConnection, RendererNode, Vec2 } from './renderer.types';
import { findById, getSingleType } from '../utils/data';
import { IOTypeName, IOTypeNames } from '../node/node.types';

import { cssVar } from '../utils/css';
import { NodeConnection } from '../runtime/runtime.types';
import { svgElement } from '../utils/document';
import { cssSelectors } from '../ui/cssSelectors';
import { svgBezierCommand, svgPath } from './svg';

export const createConnectionGradient = (
  inputColor: IOTypeName,
  outputColor: IOTypeName,
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
  gradient.id = cssSelectors.renderer.svg.gradientId(inputColor, outputColor);
  return gradient;
};

export const createAllConnectionGradients = (defs: SVGDefsElement) => {
  // create all color combinations
  const gradients = [];
  for (let i = 0; i < IOTypeNames.length; i++) {
    for (let j = 0; j < IOTypeNames.length; j++) {
      const startColor = IOTypeNames[i];
      const endColor = IOTypeNames[j];
      gradients.push(createConnectionGradient(startColor, endColor));
    }
  }
  defs.append(...gradients);
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

export const getConnectionGradientId = (connection: RendererConnection) => {
  const colors: [IOTypeName, IOTypeName] = [
    getSingleType(connection.outputNode.type),
    getSingleType(connection.inputNode.type),
  ];
  if (connection.inputNode.position.x < connection.outputNode.position.x) {
    colors.reverse();
  }
  return cssSelectors.renderer.svg.gradientId(...colors);
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
  color: IOTypeName,
  svg: SVGSVGElement,
) => {
  const pendingConnectionGroup = svg.querySelector(
    '#node__connection__pending',
  );
  const path = svgPath(
    [startPos, endPos],
    svgBezierCommand(0.35),
    cssSelectors.renderer.svg.gradientId(
      getSingleType(color),
      getSingleType(color),
    ),
  );
  !!pendingConnectionGroup && pendingConnectionGroup.replaceChildren(path);
};

export const clearPendingConnection = (svg: SVGSVGElement) => {
  const pendingConnectionGroup = svg.querySelector(
    '#node__connection__pending',
  );
  !!pendingConnectionGroup && pendingConnectionGroup.replaceChildren();
};
