import {
  DefinedIOType,
  IOTypeName,
  NodeIO,
  NodeIOWithId,
  NodeWithId,
} from '../../node/node.types';
import { RendererNode, Vec2 } from '../renderer.types';
import { createCardIoRow, updateIoRow } from './ioRow';
import { findById } from '../../utils/data';
import { Runtime } from '../../runtime/runtime';
import { cssSelectors } from './cssSelectors';
import { element } from '../../utils/document';

export const createCard = (
  node: NodeWithId<DefinedIOType, IOTypeName>,
  position: Vec2,
  selectCard: () => void,
  setIoValue?: (
    ioId: number,
    value: DefinedIOType,
    kind: NodeIO['kind'],
  ) => void,
) => {
  const card = element<HTMLElement>('article');

  card.classList.add(cssSelectors.nodeCard.root);
  card.classList.add(cssSelectors.nodeCard.type(node.type));
  card.id = cssSelectors.nodeCard.id(node.id);
  card.dataset.id = String(node.id);

  // fire select event on card pointer down
  card.addEventListener('pointerdown', selectCard);

  // position card
  setCardPosition(card, position);

  const cardHeader = createCardHeader(node);
  card.appendChild(cardHeader);
  createCardTitle(cardHeader, node);
  const io = createCardIO(card, node, setIoValue);

  return { card, cardHeader, ...io };
};

export const createCardHeader = (
  node: NodeWithId<DefinedIOType, IOTypeName>,
) => {
  const cardHeader = element<HTMLElement>('header');
  cardHeader.classList.add(cssSelectors.nodeCard.header);
  cardHeader.classList.add(cssSelectors.nodeCard.type(node.type));
  cardHeader.classList.add(cssSelectors.nodeCard.category(node.category));

  return cardHeader;
};

export const createCardTitle = (
  header: HTMLElement,
  node: NodeWithId<DefinedIOType, IOTypeName>,
) => {
  if (!node.title) return;
  const title = element<HTMLHeadingElement>('h3');

  title.innerText = node.title + ' ' + node.id;
  title.classList.add(cssSelectors.nodeCard.title);

  header.appendChild(title);
};

export const createCardIO = (
  card: HTMLElement,
  node: NodeWithId<DefinedIOType, IOTypeName>,
  setIoValue?: (
    ioId: number,
    value: DefinedIOType,
    kind: NodeIO['kind'],
  ) => void,
) => {
  const ioContainer = element<HTMLDivElement>('div');
  const inputList = element<HTMLUListElement>('ul');
  const outputList = element<HTMLUListElement>('ul');

  ioContainer.classList.add(cssSelectors.nodeCard.ioContainer);
  inputList.classList.add(
    cssSelectors.nodeCard.inputs,
    cssSelectors.nodeCard.io,
  );
  outputList.classList.add(
    cssSelectors.nodeCard.outputs,
    cssSelectors.nodeCard.io,
  );
  // store inputs and outputs to attach events;
  const outputs: HTMLLIElement[] = [];
  const inputs: HTMLLIElement[] = [];
  // compose io value setter params with available unchanging data
  const ioValueSetter =
    (ioId: number, kind: NodeIO['kind']) => (value: DefinedIOType) =>
      setIoValue && setIoValue(ioId, value, kind);

  if (node.inputs.length > 0) {
    node.inputs.forEach((input) =>
      inputs.push(
        createCardIoRow(
          inputList,
          input,
          node,
          ioValueSetter(input.id, 'input'),
        ),
      ),
    );
    ioContainer.append(inputList);
  }
  if (node.outputs.length > 0) {
    node.outputs.forEach((output) =>
      outputs.push(
        createCardIoRow(
          outputList,
          output,
          node,
          ioValueSetter(output.id, 'output'),
        ),
      ),
    );
    ioContainer.append(outputList);
  }
  card.appendChild(ioContainer);

  return { inputs, outputs };
};

export const setCardPosition = (card: HTMLElement, position: Vec2) => {
  card.style.setProperty('--x-pos', position.x + 'px');
  card.style.setProperty('--y-pos', position.y + 'px');
};

export const updateCardIo = (
  rendererNode: RendererNode<DefinedIOType, IOTypeName>,
  setIoValue: (
    ioId: number,
    value: DefinedIOType,
    kind: NodeIO['kind'],
  ) => void,
) => {
  const update = (ioList: NodeIOWithId[], ioElements: HTMLLIElement[]) => {
    // for each node io in list, update indicator and data attrs
    ioList.forEach((io) => {
      const element = findById(
        ioElements,
        cssSelectors.ioRow.id(
          rendererNode.node.id,
          io.id,
          io.kind === 'output',
        ),
      );
      if (!element) return;
      updateIoRow(element, io, (value: DefinedIOType) =>
        setIoValue(io.id, value, io.kind),
      );
    });
  };
  update(rendererNode.node.inputs, rendererNode.io.inputs);
  update(rendererNode.node.outputs, rendererNode.io.outputs);
};

export const updateAllCardIos = (
  rendererNodes: RendererNode<DefinedIOType, IOTypeName>[],
  setIOValue: Runtime['setNodeIoValue'],
) =>
  rendererNodes.forEach((rendererNode) =>
    updateCardIo(
      rendererNode,
      (ioId: number, value: DefinedIOType, kind: NodeIO['kind']) =>
        setIOValue(rendererNode.node.id, ioId, value, kind),
    ),
  );

export const setCardHighlight = (
  rendererNode: RendererNode<DefinedIOType, IOTypeName>,
  highlight: boolean,
) => {
  rendererNode.card.classList.toggle(
    cssSelectors.nodeCard.highlight,
    highlight,
  );
};
