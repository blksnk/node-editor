import { Node } from '../node/node';
import {
  DefinedIOType,
  IOArrayTypeNames,
  NodeIO,
  NodeWithId,
} from '../node/node.types';
import { Renderer } from '../renderer/renderer';
import { AnyNodeKey, NodeIndex } from '../node/nodeIndex';
import {
  NodeConnection,
  NodeConnectionAttempt,
  NodeConnectionBreak,
} from './runtime.types';
import { getUniqueConnections } from '../renderer/connection';
import { findById, getSingleType } from '../utils/data';
import { Vec2 } from '../renderer/renderer.types';
import { KeyboardHandler } from '../keyboard/keyboard';

export class Runtime {
  nodes: NodeWithId[] = [];
  connections: NodeConnection[] = [];
  nextNodeId = 0;
  renderer: Renderer;
  keyboard: KeyboardHandler;

  constructor() {
    this.keyboard = new KeyboardHandler();
    this.renderer = new Renderer({
      target: document.body,
      runtime: this,
      keyboard: this.keyboard,
    });
  }

  registerNode(node: Node, position?: Vec2) {
    const withId = node.assignId(this.nextNodeId);
    this.nextNodeId++;
    this.nodes.push(withId);
    this.renderer.attachNode(withId, position);
    this.updateConnections();
  }

  updateConnections() {
    this.connections = getUniqueConnections(this.nodes);
    this.renderer.updateConnections(this.connections);
  }

  createNode(k: AnyNodeKey, position?: Vec2) {
    const node = new NodeIndex[k]();
    this.registerNode(node as unknown as Node, position);
  }

  deleteNode(id: number) {
    // get node
    const node = this.getNode(id);
    if (node === undefined) return;
    // detach from renderer
    this.renderer.detachNode(id);
    // remove node from internal array
    this.nodes.splice(this.nodes.indexOf(node), 1);
  }

  getNode(query: number) {
    return findById(this.nodes, query);
  }

  connectNodes(connection: {
    outputNode: {
      id: number;
      ioId: number;
    };
    inputNode: {
      id: number;
      ioId: number;
    };
  }) {
    const outputNode = this.getNode(connection.outputNode.id);
    const inputNode = this.getNode(connection.inputNode.id);
    if (outputNode === undefined || inputNode === undefined) return;

    const inputIo = findById(inputNode.inputs, connection.inputNode.ioId);
    const outputIo = findById(outputNode.outputs, connection.outputNode.ioId);
    if (inputIo === undefined || outputIo === undefined) return;

    if (
      !this.checkConnectionAttempt({
        inputNode: {
          ...connection.inputNode,
          type: inputIo.type,
        },
        outputNode: {
          ...connection.outputNode,
          type: outputIo.type,
        },
      })
    )
      return;

    inputNode.connectInput(
      outputNode,
      connection.outputNode.ioId,
      connection.inputNode.ioId,
    );
    outputNode.connectOutput(
      inputNode,
      connection.inputNode.ioId,
      connection.outputNode.ioId,
    );

    this.updateConnections();
  }

  breakConnection(connection: NodeConnectionBreak) {
    // break connections at node level, update runtime connections using object references
    const inputNode = findById(this.nodes, connection.inputNode.id);
    const outputNode = findById(this.nodes, connection.outputNode.id);
    if (!inputNode || !outputNode) return;
    console.log(inputNode, outputNode, connection);
    inputNode.disconnectIo(
      connection.inputNode.ioId,
      connection.outputNode,
      'input',
    );
    outputNode.disconnectIo(
      connection.outputNode.ioId,
      connection.inputNode,
      'output',
    );
    this.updateConnections();
  }

  checkConnectionAttempt(candidate: NodeConnectionAttempt): boolean {
    const singleConnectingToMulti =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      IOArrayTypeNames.includes(candidate.inputNode.type) &&
      getSingleType(candidate.inputNode.type) === candidate.outputNode.type;
    const typeValid =
      candidate.inputNode.type === candidate.outputNode.type ||
      singleConnectingToMulti;
    const notSameNode = candidate.inputNode.id !== candidate.outputNode.id;
    return typeValid && notSameNode;
  }

  setNodeIoValue(
    nodeId: number,
    ioId: number,
    value: DefinedIOType,
    kind: NodeIO['kind'],
  ) {
    const node = this.getNode(nodeId);

    valueSetter: {
      if (!node) break valueSetter;
      console.log('set node value');
      node.setIoValue(ioId, value, kind);
      this.renderer.updateCardIos();
    }
  }
}
