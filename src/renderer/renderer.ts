import {
  PendingRendererConnection,
  RendererConnection,
  RendererNode,
  RendererOptions,
  Vec2,
} from "./renderer.types";
import {
  createCard,
  getIoInformation,
  getNodeIoId,
  setCardPosition,
  updateAllCardIos,
} from "./card";
import {
  DefinedIOType,
  IOTypeName,
  NodeConnectionInfo,
  NodeWithId,
} from "../node/node.types";
import { Runtime } from "../runtime/runtime";
import { clickPos, vecDelta } from "../utils/vectors";
import {
  assignIoPositions,
  clearPendingConnection,
  createConnectionSvg,
  getIOIndicatorPosition,
  renderConnections,
  renderPendingConnection,
} from "./connection";
import { NodeConnection } from "../runtime/runtime.types";
import { findById } from "../utils/data";

export class Renderer {
  root: HTMLDivElement;
  target: RendererOptions['target'];
  connectionRoot: SVGSVGElement;
  nodeCards: RendererNode<DefinedIOType, IOTypeName>[] = [];
  nodeConnections: RendererConnection[] = [];
  runtime: Runtime;
  mouseDownPos: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  mousePos: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  mouseDown = false;
  cardMoving = false;
  pendingConnection: PendingRendererConnection = {
    inputNode: undefined,
    outputNode: undefined,
    active: false,
  };
  selectedCardId: number | undefined = undefined;


  constructor(options: RendererOptions) {
    this.target = options.target;
    this.runtime = options.runtime;
    this.root = document.createElement('div');
    this.connectionRoot = createConnectionSvg();
    this.attachRoot();
    this.initGlobalEvents();
  }

  attachRoot() {
    this.root.classList.add('node__renderer__root');
    this.target.appendChild(this.root);
    this.root.appendChild(this.connectionRoot);
  }

  attachNode(node: NodeWithId<DefinedIOType, IOTypeName>, position: Vec2 = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 3,
  }) {
    // create node card and attach it to dom
    const {
      card,
      cardHeader,
      inputs,
      outputs,
    } = createCard(node, position, this.onCardSelect.bind(this));
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

  initCardEvents({ io, header }: RendererNode<DefinedIOType, IOTypeName>) {
    const eventOptions = { passive: false };
    header.addEventListener('pointerdown', this.onCardHeaderDown.bind(this));
    io.inputs.forEach(element => {
      element.addEventListener('pointerdown', this.onInputDown.bind(this), eventOptions);
      element.addEventListener('pointerup', this.onInputUp.bind(this), eventOptions);
    });

    io.outputs.forEach(element => {
      element.addEventListener('pointerdown', this.onOutputDown.bind(this), eventOptions);
      element.addEventListener('pointerup', this.onOutputUp.bind(this), eventOptions);
    });
  }

  initGlobalEvents() {
    window.addEventListener('pointerup', this.onGlobalUp.bind(this));
    window.addEventListener('pointermove', this.onGlobalMove.bind(this));
  }

  findNodeCard(query: number) {
    return findById(this.nodeCards, query);
  }

  findConnection(inputNodeId: number, inputIoId: number, outputNodeId: number, outputIoId: number) {
    return this.nodeConnections.find(c => (
      c.inputNode.id === inputNodeId
      && c.inputNode.ioId === inputIoId
      && c.outputNode.id === outputNodeId
      && c.outputNode.ioId === outputIoId
    ));
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
    updateAllCardIos(this.nodeCards);
    renderConnections(this.nodeConnections, this.connectionRoot);
  }

  onInputDown(e: PointerEvent) {
    e.stopPropagation();
    const pos = clickPos(e);
    this.mouseDown = true;
    this.mouseDownPos = pos;
    this.mousePos = pos;
    const el = e.target as HTMLLIElement;
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
    if (info.connected && typeof info.connection?.id === 'number' && typeof info.connection?.ioId === 'number') {
      // remove connection and start pending connection with previously connected input
      breakConnection:
      {
        // get actual connection, connected node, output data and element
        const outputNodeCard = this.findNodeCard(info.connection.id);
        if (!outputNodeCard) break breakConnection;

        const connectedOutput = findById(outputNodeCard.node.outputs, info.connection.ioId);
        const connectedOutputElement = findById(outputNodeCard.io.outputs, getNodeIoId(outputNodeCard.node.id, info.connection.ioId, true));
        if (!connectedOutputElement || !connectedOutput) break breakConnection;

        const connection = this.findConnection(info.nodeId, info.ioId, info.connection.id, info.connection.ioId);
        if (!connection) break breakConnection;
        // ask runtime to break connection
        this.runtime.breakConnection(connection);

        // start pending connection from previously connected output
        this.setPendingConnectionIo(connectedOutputElement, {
          nodeId: outputNodeCard.node.id,
          ioId: info.connection.ioId,
          type: connectedOutput.type,
        }, 'outputNode');
      }
    }
  }

  onInputUp(e: PointerEvent) {
    this.mouseDown = false;
    this.mousePos = clickPos(e);
    const el = e.target as HTMLLIElement;
    const info = getIoInformation(el);
    // only allow connection between input and output nodes, not both of same kind
    if (this.pendingConnection.active && this.pendingConnection.outputNode) {
      this.setPendingConnectionIo(el, info, 'inputNode');
      this.attemptConnection();
    }
  }

  onOutputDown(e: PointerEvent) {
    e.stopPropagation();
    const pos = clickPos(e);
    this.mouseDown = true;
    this.mouseDownPos = pos;
    this.mousePos = pos;
    const el = e.target as HTMLLIElement;
    const info = getIoInformation(el);
    this.setPendingConnectionIo(el, info, 'outputNode');
    this.pendingConnection.active = true;
  }

  setPendingConnectionIo(el: HTMLLIElement, info: Pick<ReturnType<typeof getIoInformation>, 'nodeId' | 'ioId' | 'type'>, kind: 'inputNode' | 'outputNode') {
    this.pendingConnection[kind] = {
      id: info.nodeId,
      ioId: info.ioId,
      position: getIOIndicatorPosition(el),
      type: info.type,
    };
  }

  onOutputUp(e: PointerEvent) {
    this.mouseDown = false;
    this.mousePos = clickPos(e);
    console.log('o up');
    const el = e.target as HTMLLIElement;
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
      this.pendingConnection.outputNode !== undefined
      && this.pendingConnection.inputNode !== undefined
      && this.pendingConnection.active
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
    if (this.selectedCardId !== undefined && this.mouseDown && this.cardMoving) {
      const card = this.findNodeCard(this.selectedCardId);
      if (!card) return;
      this.moveNodeCard(card, delta);
    }
    // handle pending connection
    connectionUpdate: if (this.pendingConnection.active) {
      const connectionStart = this.pendingConnection.inputNode ?? this.pendingConnection.outputNode;
      if (!connectionStart) {
        break connectionUpdate;
      }
      const startPos = connectionStart.position;
      const endPos = this.mousePos;
      renderPendingConnection(startPos, endPos, connectionStart.type, this.connectionRoot);
    }
  }

  moveNodeCard(nodeCard: RendererNode<DefinedIOType, IOTypeName>, delta: Vec2) {
    nodeCard.position.x += delta.x;
    nodeCard.position.y += delta.y;
    setCardPosition(nodeCard.card, nodeCard.position);
    this.runtime.updateConnections();
  }

  onCardHeaderDown(e: PointerEvent) {
    const pos = clickPos(e);
    this.mouseDown = true;
    this.cardMoving = true;
    this.mouseDownPos = pos;
    this.mousePos = pos;
  }

  onCardSelect(id: number) {
    if (!this.mouseDown) {
      this.selectedCardId = id;
    }
  }
}

