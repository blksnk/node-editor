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
import { eventPos, vecDelta } from '../utils/vectors';
import {
  assignIoPositions,
  clearPendingConnection,
  getIOIndicatorPosition,
  renderConnections,
  renderPendingConnection,
} from './connection';
import { NodeConnection } from '../runtime/runtime.types';
import { findById, isDefined } from '../utils/data';
import {
  createCard,
  setCardHighlight,
  setCardPosition,
  updateAllCardIos,
} from '../ui/components/card';
import { getIoInformation } from '../ui/components/ioRow';
import { KeyboardHandler } from '../keyboard/keyboard';
import { element } from '../utils/document';
import { cssSelectors } from '../ui/cssSelectors';
import { createRendererSvg, resizeSvg } from './svg';
import { AnyNodeKey } from '../node/nodeIndex';

export class Renderer {
  root: HTMLDivElement;
  target: RendererOptions['target'];
  svgRoot: SVGSVGElement;
  nodeCards: RendererNode[] = [];
  nodeConnections: RendererConnection[] = [];
  runtime: Runtime;
  keyboard: KeyboardHandler;
  mouseDownPos: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  mousePos: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  mouseDown = false;
  cardMoving = false;
  hasMoved = false;
  duplicateCardCreated = false;
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
    this.root = element<HTMLDivElement>('div', cssSelectors.renderer.root);
    this.svgRoot = createRendererSvg();
    this.attachRoot();
    this.initGlobalEvents();
    this.initKeyboardEvents();
  }

  private get movingNodeCards(): RendererNode[] {
    return Array.from(this.selectedCardIds)
      .map((id) => this.findNodeCard(id))
      .filter((card) => !!card) as RendererNode[];
  }

  public attachNode(node: NodeWithId, position: Vec2 = this.mousePos) {
    // unselect any cards before attaching new node
    this.resetSelectedCards();

    // create node card and attach it to dom
    const { card, cardHeader, inputs, outputs } = createCard(
      node,
      position,
      (ioId: number, value: DefinedIOType, kind: NodeIO['kind']) =>
        this.runtime.setNodeIoValue(node.id, ioId, value, kind),
    );
    this.root.appendChild(card);
    setCardPosition(card, position);
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
    // newly attached card follows mouse for placement
    this.selectedCardIds.add(rendererNode.id);
    this.highlightSelectedCards();
    this.mouseDown = true;
    this.cardMoving = true;
    this.hasMoved = true;
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
    this.updateCardIos();
    this.updateConnectionCoords(connections);
  }

  public updateConnectionCoords(connections: NodeConnection[]) {
    this.nodeConnections = assignIoPositions(connections, this.nodeCards);
    renderConnections(this.nodeConnections, this.svgRoot);
  }

  public resetSelectedCards() {
    this.selectedCardIds.clear();
  }

  public unselectAllCards(e: PointerEvent) {
    if (e.target === this.root) {
      console.log('unselect all');
      this.resetSelectedCards();
      this.highlightSelectedCards();
    }
  }

  public highlightSelectedCards() {
    // highlight selected cards, not others
    this.nodeCards.forEach(({ id }) => {
      this.setCardHighlight(id, this.selectedCardIds.has(id));
    });
  }

  public updateNodeCardNodes(nodes: NodeWithId[]) {
    nodes.forEach((node) => {
      const nodeCard = this.findNodeCard(node.id);
      if (nodeCard) {
        nodeCard.node = node;
      }
    });
    this.updateCardIos();
  }

  public updateCardIos() {
    updateAllCardIos(
      this.nodeCards,
      this.runtime.setNodeIoValue.bind(this.runtime),
    );
  }

  onGlobalUp(e: PointerEvent) {
    this.mouseDown = false;
    this.cardMoving = false;
    this.hasMoved = false;
    this.duplicateCardCreated = false;
    this.mousePos = eventPos(e);
    this.resetPendingConnection();
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
    this.target.appendChild(this.root);
    this.root.appendChild(this.svgRoot);
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
    this.root.addEventListener('pointerup', this.unselectAllCards.bind(this));
  }

  private initKeyboardEvents() {
    this.keyboard.addListener('keydown', (e) => {
      if (
        e.key === 'Delete' ||
        ((this.keyboard.meta || this.keyboard.ctrl) && e.key === 'Backspace')
      ) {
        this.deleteSelectedCards();
      }
      if ((e.ctrl || e.meta) && (e.key === 'a' || e.key === 'A')) {
        e.genericEvent.preventDefault();
        this.selectAllCards();
      }
    });
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
    const pos = eventPos(e);
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
    this.mousePos = eventPos(e);
    const info = getIoInformation(el);
    // only allow connection between input and output nodes, not both of same kind
    if (this.pendingConnection.active && this.pendingConnection.outputNode) {
      this.setPendingConnectionIo(el, info, 'inputNode');
      this.attemptConnection();
    }
  }

  private onOutputDown(e: PointerEvent, el: HTMLLIElement) {
    e.stopPropagation();
    const pos = eventPos(e);
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
    this.mousePos = eventPos(e);
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
    clearPendingConnection(this.svgRoot);
  }

  private onGlobalMove(e: PointerEvent) {
    const lastMousePos = { ...this.mousePos };
    this.mousePos = eventPos(e);
    const delta = vecDelta(this.mousePos, lastMousePos);
    // handle card move
    if (this.selectedCardIds.size > 0 && this.mouseDown && this.cardMoving) {
      if (this.movingNodeCards.length === 0) return;
      this.hasMoved = true;
      // duplicate cards
      if (this.keyboard.alt && !this.duplicateCardCreated) {
        this.duplicateSelectedNodeCards();
      }
      this.movingNodeCards.forEach((card) => {
        this.moveNodeCard(card, delta);
      });
      this.updateConnectionCoords(this.runtime.connections);
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
        this.svgRoot,
      );
    }
  }

  private duplicateSelectedNodeCards() {
    this.duplicateCardCreated = true;
    // create new cards based on source cards kind and position
    const duplicatedNodes = this.movingNodeCards.map(({ node, position }) =>
      this.runtime.createNode(node.kind as AnyNodeKey, position),
    );
    // select all newly created node cards
    this.resetSelectedCards();
    duplicatedNodes.forEach(({ id }) => this.selectedCardIds.add(id));
    this.highlightSelectedCards();
  }

  private moveNodeCard(nodeCard: RendererNode, delta: Vec2) {
    nodeCard.position.x += delta.x;
    nodeCard.position.y += delta.y;
    setCardPosition(nodeCard.card, nodeCard.position);
  }

  private onCardHeaderDown(e: PointerEvent) {
    const pos = eventPos(e);
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
    resizeSvg(this.svgRoot);
  }

  private deleteSelectedCards() {
    console.log(this.selectedCardIds, this.movingNodeCards);
    this.runtime.deleteMultipleNodes([...this.selectedCardIds]);
    this.resetSelectedCards();
    this.highlightSelectedCards();
  }

  private selectAllCards() {
    this.nodeCards.forEach(({ id }) => {
      this.selectedCardIds.add(id);
    });
    this.highlightSelectedCards();
  }
}
