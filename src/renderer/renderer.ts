import {
  PendingRendererConnection,
  RendererConnection,
  RendererNode,
  RendererOptions,
  Vec2,
} from './renderer.types';
import {
  DefinedIOType,
  IOTypeName,
  NodeConnectionInfo,
  NodeIO,
  NodeWithId,
} from '../node/node.types';
import { Runtime } from '../runtime/runtime';
import { clickPos, vecDelta } from '../utils/vectors';
import {
  assignIoPositions,
  clearPendingConnection,
  createConnectionSvg,
  getIOIndicatorPosition,
  renderConnections,
  renderPendingConnection,
  resizeSvg,
} from './connection';
import { NodeConnection } from '../runtime/runtime.types';
import { findById } from '../utils/data';
import {
  createCard,
  setCardPosition,
  updateAllCardIos,
} from './components/card';
import { getIoInformation } from './components/ioRow';
import { KeyboardHandler } from '../keyboard/keyboard';
import { element } from '../utils/document';
import { cssSelectors } from './components/cssSelectors';

export class Renderer {
  root: HTMLDivElement;
  target: RendererOptions['target'];
  connectionRoot: SVGSVGElement;
  nodeCards: RendererNode<DefinedIOType, IOTypeName>[] = [];
  nodeConnections: RendererConnection[] = [];
  runtime: Runtime;
  keyboard: KeyboardHandler;
  mouseDownPos: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  mousePos: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  mouseDown = false;
  cardMoving = false;
  pendingConnection: PendingRendererConnection = {
    inputNode: undefined,
    outputNode: undefined,
    active: false,
  };
  movingCardIds: Set<number> = new Set<number>();
  selectedNodeId: number | undefined = undefined;

  constructor(options: RendererOptions) {
    this.target = options.target;
    this.runtime = options.runtime;
    this.keyboard = options.keyboard;
    this.root = element<HTMLDivElement>('div');
    this.connectionRoot = createConnectionSvg();
    this.attachRoot();
    this.initGlobalEvents();
  }

  get movingNodeCards(): RendererNode<DefinedIOType, IOTypeName>[] {
    return Array.from(this.movingCardIds)
      .map((id) => this.findNodeCard(id))
      .filter((card) => !!card) as RendererNode<DefinedIOType, IOTypeName>[];
  }

  attachRoot() {
    this.root.classList.add('node__renderer__root');
    this.target.appendChild(this.root);
    this.root.appendChild(this.connectionRoot);
  }

  attachNode(
    node: NodeWithId<DefinedIOType, IOTypeName>,
    position: Vec2 = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
    },
  ) {
    // create node card and attach it to dom
    const { card, cardHeader, inputs, outputs } = createCard(
      node,
      position,
      () => this.selectCard(node.id),
      (ioId: number, value: DefinedIOType, kind: NodeIO['kind']) =>
        this.runtime.setNodeIoValue(node.id, ioId, value, kind),
    );
    this.root.appendChild(card);
    const rendererNode = {
      card,
      node,
      id: node.id,
      io: {
        inputs,
        outputs,
      },
      position,
      header: cardHeader,
    };
    this.initCardEvents(rendererNode);
    this.nodeCards.push(rendererNode);
    this.runtime.updateConnections();
  }

  initCardEvents({ io, header, id }: RendererNode<DefinedIOType, IOTypeName>) {
    const eventOptions = { passive: false };
    header.addEventListener('pointerdown', (e) => this.onCardHeaderDown(e, id));
    io.inputs.forEach((element) => {
      element.addEventListener(
        'pointerdown',
        (e) => this.onInputDown(e, element),
        eventOptions,
      );
      element.addEventListener(
        'pointerup',
        (e) => this.onInputUp(e, element),
        eventOptions,
      );
    });

    io.outputs.forEach((element) => {
      element.addEventListener(
        'pointerdown',
        (e) => this.onOutputDown(e, element),
        eventOptions,
      );
      element.addEventListener(
        'pointerup',
        (e) => this.onOutputUp(e, element),
        eventOptions,
      );
    });
  }

  initGlobalEvents() {
    window.addEventListener('pointerup', this.onGlobalUp.bind(this));
    window.addEventListener('pointermove', this.onGlobalMove.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  findNodeCard(query: number) {
    return findById(this.nodeCards, query);
  }

  findConnection(
    inputNodeId: number,
    inputIoId: number,
    outputNodeId: number,
    outputIoId: number,
  ) {
    return this.nodeConnections.find(
      (c) =>
        c.inputNode.id === inputNodeId &&
        c.inputNode.ioId === inputIoId &&
        c.outputNode.id === outputNodeId &&
        c.outputNode.ioId === outputIoId,
    );
  }

  detachNode(id: number) {
    // get node
    const node = this.findNodeCard(id);
    if (node === undefined) return;
    // delete existing connections

    // remove node card from dom
    node.card.remove();
    // and from internal array
    this.nodeCards.splice(this.nodeCards.indexOf(node), 1);
  }

  updateConnections(connections: NodeConnection[]) {
    this.nodeConnections = assignIoPositions(connections, this.nodeCards);
    this.updateCardIos();
    renderConnections(this.nodeConnections, this.connectionRoot);
  }

  updateCardIos() {
    updateAllCardIos(
      this.nodeCards,
      this.runtime.setNodeIoValue.bind(this.runtime),
    );
  }

  onInputDown(e: PointerEvent, el: HTMLLIElement) {
    e.stopPropagation();
    const pos = clickPos(e);
    this.mouseDown = true;
    this.mouseDownPos = pos;
    this.mousePos = pos;
    const info = getIoInformation(el);
    console.log(info);

    // check if input is connected
    if (info.connected) {
      this.disconnectNodes(info);
    } else {
      this.setPendingConnectionIo(el, info, 'inputNode');
    }
    this.pendingConnection.active = true;
  }

  disconnectNodes(info: NodeConnectionInfo) {
    if (
      info.connected &&
      typeof info.connection?.id === 'number' &&
      typeof info.connection?.ioId === 'number'
    ) {
      // remove connection and start pending connection with previously connected input
      breakConnection: {
        // get actual connection, connected node, output data and element
        const outputNodeCard = this.findNodeCard(info.connection.id);
        if (!outputNodeCard) break breakConnection;

        const connectedOutput = findById(
          outputNodeCard.node.outputs,
          info.connection.ioId,
        );
        const connectedOutputElement = findById(
          outputNodeCard.io.outputs,
          cssSelectors.ioRow.id(
            outputNodeCard.node.id,
            info.connection.ioId,
            true,
          ),
        );
        if (!connectedOutputElement || !connectedOutput) break breakConnection;

        const connection = this.findConnection(
          info.nodeId,
          info.ioId,
          info.connection.id,
          info.connection.ioId,
        );
        if (!connection) break breakConnection;
        // ask runtime to break connection
        this.runtime.breakConnection(connection);

        // start pending connection from previously connected output
        this.setPendingConnectionIo(
          connectedOutputElement,
          {
            nodeId: outputNodeCard.node.id,
            ioId: info.connection.ioId,
            type: connectedOutput.type,
          },
          'outputNode',
        );
      }
    }
  }

  onInputUp(e: PointerEvent, el: HTMLLIElement) {
    this.mouseDown = false;
    this.mousePos = clickPos(e);
    const info = getIoInformation(el);
    // only allow connection between input and output nodes, not both of same kind
    if (this.pendingConnection.active && this.pendingConnection.outputNode) {
      this.setPendingConnectionIo(el, info, 'inputNode');
      this.attemptConnection();
    }
  }

  onOutputDown(e: PointerEvent, el: HTMLLIElement) {
    e.stopPropagation();
    const pos = clickPos(e);
    this.mouseDown = true;
    this.mouseDownPos = pos;
    this.mousePos = pos;
    const info = getIoInformation(el);
    this.setPendingConnectionIo(el, info, 'outputNode');
    this.pendingConnection.active = true;
  }

  setPendingConnectionIo(
    el: HTMLLIElement,
    info: Pick<ReturnType<typeof getIoInformation>, 'nodeId' | 'ioId' | 'type'>,
    kind: 'inputNode' | 'outputNode',
  ) {
    this.pendingConnection[kind] = {
      id: info.nodeId,
      ioId: info.ioId,
      position: getIOIndicatorPosition(el),
      type: info.type,
    };
  }

  onOutputUp(e: PointerEvent, el: HTMLLIElement) {
    this.mouseDown = false;
    this.mousePos = clickPos(e);
    console.log('o up');
    const info = getIoInformation(el);
    // only allow connection between input and output nodes, not both of same kind
    if (this.pendingConnection.active && this.pendingConnection.inputNode) {
      this.setPendingConnectionIo(el, info, 'outputNode');
      this.attemptConnection();
    }
  }

  attemptConnection() {
    // check if pending connection is between same types before committing to connection
    if (
      this.pendingConnection.outputNode !== undefined &&
      this.pendingConnection.inputNode !== undefined &&
      this.pendingConnection.active
    ) {
      console.log({ ...this.pendingConnection });
      this.runtime.connectNodes(this.pendingConnection);
    } else {
      // TODO: Show type error to user
    }
    this.resetPendingConnection();
  }

  resetPendingConnection() {
    this.pendingConnection.active = false;
    this.pendingConnection.inputNode = undefined;
    this.pendingConnection.outputNode = undefined;
    clearPendingConnection(this.connectionRoot);
  }

  onGlobalUp(e: PointerEvent) {
    this.mouseDown = false;
    this.cardMoving = false;
    this.mousePos = clickPos(e);
    this.resetPendingConnection();
  }

  onGlobalMove(e: PointerEvent) {
    const lastMousePos = { ...this.mousePos };
    this.mousePos = clickPos(e);
    const delta = vecDelta(this.mousePos, lastMousePos);
    // handle card move
    if (this.movingCardIds.size > 0 && this.mouseDown && this.cardMoving) {
      if (this.movingNodeCards.length === 0) return;
      this.movingNodeCards.forEach((card) => {
        this.moveNodeCard(card, delta);
      });
    }
    // handle pending connection
    connectionUpdate: if (this.pendingConnection.active) {
      const connectionStart =
        this.pendingConnection.inputNode ?? this.pendingConnection.outputNode;
      if (!connectionStart) {
        break connectionUpdate;
      }
      const startPos = connectionStart.position;
      const endPos = this.mousePos;
      renderPendingConnection(
        startPos,
        endPos,
        connectionStart.type,
        this.connectionRoot,
      );
    }
  }

  moveNodeCard(nodeCard: RendererNode<DefinedIOType, IOTypeName>, delta: Vec2) {
    nodeCard.position.x += delta.x;
    nodeCard.position.y += delta.y;
    setCardPosition(nodeCard.card, nodeCard.position);
    this.runtime.updateConnections();
  }

  onCardHeaderDown(e: PointerEvent, nodeId: number) {
    const pos = clickPos(e);
    this.mouseDown = true;
    this.cardMoving = true;
    this.mouseDownPos = pos;
    this.mousePos = pos;
    // set current node card as only one moving of user is not pressing shift
    if (!this.keyboard.shift) {
      this.movingCardIds.clear();
    }
    this.movingCardIds.add(nodeId);
  }

  selectCard(id: number) {
    this.selectedNodeId = id;
  }

  onWindowResize() {
    resizeSvg(this.connectionRoot);
  }
}
