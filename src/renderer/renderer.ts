import {
  PendingRendererConnection,
  RendererConnection,
  RendererNode,
  RendererOptions,
  Vec2,
} from './renderer.types';
import {
  DefinedIOType,
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
import { findById, isDefined } from '../utils/data';
import {
  createCard,
  setCardHighlight,
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
  nodeCards: RendererNode[] = [];
  nodeConnections: RendererConnection[] = [];
  runtime: Runtime;
  keyboard: KeyboardHandler;
  mouseDownPos: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  mousePos: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  mouseDown = false;
  cardMoving = false;
  hasMoved = false;
  pendingConnection: PendingRendererConnection = {
    inputNode: undefined,
    outputNode: undefined,
    active: false,
  };
  selectedCardIds: Set<number> = new Set<number>();

  constructor(options: RendererOptions) {
    this.target = options.target;
    this.runtime = options.runtime;
    this.keyboard = options.keyboard;
    this.root = element<HTMLDivElement>('div');
    this.connectionRoot = createConnectionSvg();
    this.attachRoot();
    this.initGlobalEvents();
  }

  private get movingNodeCards(): RendererNode[] {
    return Array.from(this.selectedCardIds)
      .map((id) => this.findNodeCard(id))
      .filter((card) => !!card) as RendererNode[];
  }

  public attachNode(
    node: NodeWithId,
    position: Vec2 = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
    },
  ) {
    // create node card and attach it to dom
    const { card, cardHeader, inputs, outputs } = createCard(
      node,
      position,
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

  public detachNode(id: number) {
    // get node
    const node = this.findNodeCard(id);
    if (node === undefined) return;
    // delete existing connections

    // remove node card from dom
    node.card.remove();
    // and from internal array
    this.nodeCards.splice(this.nodeCards.indexOf(node), 1);
  }

  public updateConnections(connections: NodeConnection[]) {
    this.nodeConnections = assignIoPositions(connections, this.nodeCards);
    this.updateCardIos();
    renderConnections(this.nodeConnections, this.connectionRoot);
  }

  public resetSelectedCards() {
    this.selectedCardIds.clear();
  }

  public highlightSelectedCards() {
    // highlight selected cards, not others
    this.nodeCards.forEach(({ id }) => {
      this.setCardHighlight(id, this.selectedCardIds.has(id));
    });
  }

  public updateCardIos() {
    updateAllCardIos(
      this.nodeCards,
      this.runtime.setNodeIoValue.bind(this.runtime),
    );
  }

  private onCardDown(nodeId: number) {
    if (!this.selectedCardIds.has(nodeId) && !this.keyboard.shift) {
      this.resetSelectedCards();
    }
    this.selectedCardIds.add(nodeId);
    this.highlightSelectedCards();
  }

  private onCardUp(nodeId: number) {
    if (
      this.selectedCardIds.has(nodeId) &&
      !this.hasMoved &&
      !this.keyboard.shift
    ) {
      this.resetSelectedCards();
      this.selectedCardIds.add(nodeId);
    }
    this.highlightSelectedCards();
  }

  private attachRoot() {
    this.root.classList.add('node__renderer__root');
    this.target.appendChild(this.root);
    this.root.appendChild(this.connectionRoot);
  }

  private initCardEvents({ io, header, card, id }: RendererNode) {
    const eventOptions = { passive: false };
    card.addEventListener('pointerdown', () => this.onCardDown(id));
    card.addEventListener('pointerup', () => this.onCardUp(id));
    header.addEventListener('pointerdown', (e) => this.onCardHeaderDown(e));
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

  private initGlobalEvents() {
    window.addEventListener('pointerup', this.onGlobalUp.bind(this));
    window.addEventListener('pointermove', this.onGlobalMove.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private findNodeCard(query: number) {
    return findById(this.nodeCards, query);
  }

  private findConnection(
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

  private onInputDown(e: PointerEvent, el: HTMLLIElement) {
    e.stopPropagation();
    const pos = clickPos(e);
    this.mouseDown = true;
    this.mouseDownPos = pos;
    this.mousePos = pos;
    const info = getIoInformation(el);

    // check if input is connected
    if (info.connected) {
      this.disconnectNodes(info);
    } else {
      this.setPendingConnectionIo(el, info, 'inputNode');
    }
    this.pendingConnection.active = true;
  }

  private disconnectNodes(info: NodeConnectionInfo) {
    if (info.connected && isDefined(info.connections)) {
      // remove connection and start pending connection with previously connected input
      breakConnection: {
        // get actual connection, connected node, output data and element
        const outputNodeCard = this.findNodeCard(info.connections[0].id);
        if (!outputNodeCard) break breakConnection;

        const connectedOutput = findById(
          outputNodeCard.node.outputs,
          info.connections[0].ioId,
        );
        const connectedOutputElement = findById(
          outputNodeCard.io.outputs,
          cssSelectors.ioRow.id(
            outputNodeCard.node.id,
            info.connections[0].ioId,
            true,
          ),
        );
        if (!connectedOutputElement || !connectedOutput) break breakConnection;

        const connection = this.findConnection(
          info.nodeId,
          info.ioId,
          info.connections[0].id,
          info.connections[0].ioId,
        );
        if (!connection) break breakConnection;
        // ask runtime to break connection
        this.runtime.breakConnection(connection);

        // start pending connection from previously connected output
        this.setPendingConnectionIo(
          connectedOutputElement,
          {
            nodeId: outputNodeCard.node.id,
            ioId: info.connections[0].ioId,
            type: connectedOutput.type,
          },
          'outputNode',
        );
      }
    }
  }

  private onInputUp(e: PointerEvent, el: HTMLLIElement) {
    this.mouseDown = false;
    this.mousePos = clickPos(e);
    const info = getIoInformation(el);
    // only allow connection between input and output nodes, not both of same kind
    if (this.pendingConnection.active && this.pendingConnection.outputNode) {
      this.setPendingConnectionIo(el, info, 'inputNode');
      this.attemptConnection();
    }
  }

  private onOutputDown(e: PointerEvent, el: HTMLLIElement) {
    e.stopPropagation();
    const pos = clickPos(e);
    this.mouseDown = true;
    this.mouseDownPos = pos;
    this.mousePos = pos;
    const info = getIoInformation(el);
    this.setPendingConnectionIo(el, info, 'outputNode');
    this.pendingConnection.active = true;
  }

  private setPendingConnectionIo(
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

  private onOutputUp(e: PointerEvent, el: HTMLLIElement) {
    this.mouseDown = false;
    this.mousePos = clickPos(e);
    const info = getIoInformation(el);
    // only allow connection between input and output nodes, not both of same kind
    if (this.pendingConnection.active && this.pendingConnection.inputNode) {
      this.setPendingConnectionIo(el, info, 'outputNode');
      this.attemptConnection();
    }
  }

  private attemptConnection() {
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

  private resetPendingConnection() {
    this.pendingConnection.active = false;
    this.pendingConnection.inputNode = undefined;
    this.pendingConnection.outputNode = undefined;
    clearPendingConnection(this.connectionRoot);
  }

  private onGlobalUp(e: PointerEvent) {
    this.mouseDown = false;
    this.cardMoving = false;
    this.hasMoved = false;
    this.mousePos = clickPos(e);
    this.resetPendingConnection();
  }

  private onGlobalMove(e: PointerEvent) {
    const lastMousePos = { ...this.mousePos };
    this.mousePos = clickPos(e);
    const delta = vecDelta(this.mousePos, lastMousePos);
    // handle card move
    if (this.selectedCardIds.size > 0 && this.mouseDown && this.cardMoving) {
      if (this.movingNodeCards.length === 0) return;
      this.hasMoved = true;
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

  private moveNodeCard(nodeCard: RendererNode, delta: Vec2) {
    nodeCard.position.x += delta.x;
    nodeCard.position.y += delta.y;
    setCardPosition(nodeCard.card, nodeCard.position);
    this.runtime.updateConnections();
  }

  private onCardHeaderDown(e: PointerEvent) {
    const pos = clickPos(e);
    this.mouseDown = true;
    this.cardMoving = true;
    this.mouseDownPos = pos;
    this.mousePos = pos;
  }

  private setCardHighlight(id: number, highlight: boolean) {
    const nodeCard = this.findNodeCard(id);
    nodeCard && setCardHighlight(nodeCard, highlight);
  }

  private onWindowResize() {
    resizeSvg(this.connectionRoot);
  }
}
