import {
  DefinedIOType,
  IOArrayTypeNames,
  IOType,
  IOTypeName,
  NodeIO,
  NodeWithId,
} from '../node/node.types';
import { Renderer } from '../renderer/renderer';
import { AnyNodeKey, NodeIndex } from '../node/nodeIndex';
import {
  NodeConnection,
  NodeConnectionAttempt,
  NodeConnectionBreak,
  RuntimeOutput,
} from './runtime.types';
import { getUniqueConnections } from '../renderer/connection';
import { findById, getSingleType } from '../utils/data';
import { Vec2 } from '../renderer/renderer.types';
import { KeyboardHandler } from '../keyboard/keyboard';
import { RuntimeOutputNode } from '../node/runtime/output';

export class Runtime {
  nodes: NodeWithId<IOTypeName[], IOTypeName[]>[] = [];
  connections: NodeConnection[] = [];
  outputs: RuntimeOutput[] = [];
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

  registerNode(
    node: InstanceType<typeof NodeIndex[AnyNodeKey]>,
    position?: Vec2,
  ) {
    const withId = node.assignId(
      this.nextNodeId,
      this,
    ) as unknown as NodeWithId;
    if (withId.kind === 'runtime::output') {
      const outputNode = withId as unknown as RuntimeOutputNode & {
        id: number;
      };
      this.createOutput({
        name: outputNode.inputs[0].value,
        value: outputNode.inputs[1].value,
        type: outputNode.inputs[1].type,
        id: outputNode.id,
      });
    }
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
    this.registerNode(node, position);
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

  findOutput(query: number) {
    return findById(this.outputs, query);
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
    const inputType = candidate.inputNode.type;
    const outputType = candidate.outputNode.type;
    const singleConnectingToMulti =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      IOArrayTypeNames.includes(inputType) &&
      getSingleType(inputType) === outputType;
    const inputIsAnyType = inputType === 'any' || inputType === 'any[]';
    const typeValid =
      inputType === outputType || singleConnectingToMulti || inputIsAnyType;
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
      node.setIoValue(ioId, value, kind);
      this.renderer.updateCardIos();
    }
  }

  createOutput(node: {
    id: number;
    name: string;
    type: IOTypeName;
    value: IOType;
  }) {
    this.outputs.push({
      id: node.id,
      name: node.name,
      type: node.type,
      value: node.value,
    });
  }

  updateOutput(
    outputId: number,
    updatePayload: { name?: string; value?: DefinedIOType; type?: IOTypeName },
  ) {
    console.log('update output', updatePayload);
    const output = this.findOutput(outputId);
    if (!output) return;
    output.name = updatePayload.name ?? output.name;
    output.value = updatePayload.value ?? output.value;
    output.type = updatePayload.type ?? output.type;
  }
}
