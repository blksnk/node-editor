import {
  DefinedIOType,
  IOTypeName,
  NodeConnectionIds, NodeConnectionInfo,
  NodeIOWithId,
  NodeWithId
} from "../node/node.types";
import { RendererNode, Vec2 } from "./renderer.types";
import { findById } from "../utils/data";

export const createCard = (node: NodeWithId<DefinedIOType, IOTypeName>, position: Vec2, onCardSelect: (id: number) => void) => {
  const card = document.createElement('article');

  card.classList.add('node__card__root');
  card.id = 'node__' + String(node.id);
  card.dataset.id = String(node.id);

  // fire select event on card pointer down
  card.addEventListener('pointerenter', () => onCardSelect(node.id))

  // position card
  setCardPosition(card, position)

  const cardHeader = createCardHeader(node);
  card.appendChild(cardHeader);
  createCardTitle(cardHeader, node);
  const io = createCardIO(card, node);

  return { card, cardHeader, ...io };
}

export const createCardHeader = (node: NodeWithId<DefinedIOType, IOTypeName>) => {
  const cardHeader = document.createElement('header');
  cardHeader.classList.add('node__card__header');
  cardHeader.classList.add(`node__type__${node.type}`);
  cardHeader.classList.add(`node__category__${node.category}`);

  return cardHeader
}

export const createCardTitle = (header: HTMLElement, node: NodeWithId<DefinedIOType, IOTypeName>) => {
  if(!node.title) return;
  const title = document.createElement('h3');

  title.innerText = node.title + ' ' + node.id;
  title.classList.add('node__card__title');

  header.appendChild(title);
}

export const createCardIORow = (list: HTMLUListElement, io: NodeIOWithId, node: NodeWithId<DefinedIOType, IOTypeName>, isOutput = false) => {
  const li = document.createElement('li');
  const indicator = document.createElement('div');
  const name = document.createElement('span')

  li.classList.add('node__io__row');
  li.id = getNodeIoId(node.id, io.id, isOutput)
  // inject io data
  storeIOInformation(li, io)

  // style based on type and connection state
  li.classList.toggle('node__io__output', isOutput)
  li.classList.toggle('node__io__input', !isOutput)
  indicator.classList.add('node__io__indicator',);
  indicator.classList.toggle('node__io__active', Boolean(io.connection?.connected))
  indicator.classList.add(io.type);
  name.classList.add('node__io__name');

  name.textContent = io.name

  li.append(...(isOutput ? [name, indicator] : [indicator, name]));
  list.appendChild(li);
  return li;
}

export const createCardIO = (card: HTMLElement, node: NodeWithId<DefinedIOType, IOTypeName>) => {
  const ioContainer = document.createElement('div')
  const inputList = document.createElement('ul')
  const outputList = document.createElement('ul')

  ioContainer.classList.add('node__io__container')
  inputList.classList.add('node__inputs', 'node__io')
  outputList.classList.add('node__outputs', 'node__io')
  // store inputs and outputs to attach events;
  const outputs: HTMLLIElement[] = [];
  const inputs: HTMLLIElement[] = [];
  if(node.inputs.length > 0) {
    node.inputs.forEach(input =>
      inputs.push(createCardIORow(inputList, input, node, false))
    )
    ioContainer.append(inputList)
  }
  if(node.outputs.length > 0) {
    node.outputs.forEach(output =>
      outputs.push(createCardIORow(outputList, output, node,true))
    )
    ioContainer.append(outputList)
  }
  card.appendChild(ioContainer)

  return { inputs, outputs };
}

export const setCardPosition = (card: HTMLElement, position: Vec2) => {
  card.style.setProperty('--x-pos', position.x + 'px')
  card.style.setProperty('--y-pos', position.y + 'px')
}

export const getNodeIoId = (nodeId: number, ioId: number, isOutput: boolean) => `node__${nodeId}__${isOutput ? 'output' : 'input'}__${ioId}`

export const updateCardIo = (rendererNode: RendererNode<DefinedIOType, IOTypeName>) => {
  const update = (ioList: NodeIOWithId[], ioElements: HTMLLIElement[], isOutput: boolean) => {
    // for each node io in list, update indicator and data attrs
    ioList.forEach((io) => {
      const element = findById(ioElements, getNodeIoId(rendererNode.node.id, io.id, isOutput))
      if(!element) return;
      storeIOInformation(element, io);
      const indicator = element.querySelector('.node__io__indicator')
      const isConnected = io.connection?.connected ?? false;
      !!indicator && indicator.classList.toggle('node__io__active', isConnected)
    })
  }
  update(rendererNode.node.inputs, rendererNode.io.inputs, false);
  update(rendererNode.node.outputs, rendererNode.io.outputs, true);
}

export const updateAllCardIos = (rendererNodes: RendererNode<DefinedIOType, IOTypeName>[]) => rendererNodes.forEach(rendererNode => updateCardIo(rendererNode))

export const storeIOInformation = (li: HTMLLIElement, io: NodeIOWithId) => {
  li.dataset.id = String(io.id);
  li.dataset.nodeId = String(io.node.id);
  li.dataset.type = io.type;
  li.dataset.connected = String(io.connection?.connected ?? false);
  li.dataset.connection = io.connection?.connected && io.connection !== undefined ? JSON.stringify({
    id: io.connection.node.id,
    ioId: io.connection.ioId,
  }) : undefined;
}


export const getIoInformation = (io: HTMLLIElement): NodeConnectionInfo => {
  const ioId = parseInt(io.dataset.id as string);
  const nodeId = parseInt(io.dataset.nodeId as string);
  const type = io.dataset.type as IOTypeName;
  const connected = io.dataset.connected === "true";
  let connection: NodeConnectionIds | undefined;
  if(connected) {
    connection = JSON.parse(io.dataset.connection as string) as NodeConnectionIds
  }
  return { ioId, nodeId, type, connected, connection };
}