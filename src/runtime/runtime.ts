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
import {
  findById,
  getSingleType,
  isAnyType,
  isDefined,
  isUndefined,
} from '../utils/data';
import { Vec2 } from '../renderer/renderer.types';
import { KeyboardHandler } from '../keyboard/keyboard';
import { RuntimeOutputNode } from '../node/runtime/output';
import { getUniqueConnections } from './connection';

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
    this.renderer.updateNodeCardNodes(this.nodes);
    this.connections = this.breakInvalidConnections(
      getUniqueConnections(this.nodes),
    );
    this.renderer.updateConnections(this.connections);
  }

  breakInvalidConnections(connections: NodeConnection[]) {
    return connections.filter((connection) => {
      const types = [connection.inputNode.type, connection.outputNode.type];
      const shouldStay =
        getSingleType(types[0]) === getSingleType(types[1]) ||
        types.some((t) => isAnyType(t));
      const inputNode = this.findNode(connection.inputNode.node.id);
      const outputNode = this.findNode(connection.outputNode.node.id);
      if (!shouldStay || isUndefined(inputNode) || isUndefined(outputNode)) {
        this.disconnectNodes({
          inputNode: {
            id: connection.inputNode.node.id,
            ioId: connection.inputNode.ioId,
            type: connection.inputNode.type,
          },
          outputNode: {
            id: connection.outputNode.node.id,
            ioId: connection.outputNode.ioId,
            type: connection.outputNode.type,
          },
        });
      }
      return shouldStay;
    });
  }

  createNode(k: AnyNodeKey, position?: Vec2) {
    const node = new NodeIndex[k]();
    this.registerNode(node, position);
  }

  public deleteMultipleNodes(toDeleteIds: number[]) {
    // deletes multiple nodes at once and updates connections once
    const toDetachIds = toDeleteIds
      .map((toDeleteId) => {
        const nodeIndex = this.nodes.findIndex(({ id }) => toDeleteId === id);
        if (nodeIndex < 0) return undefined;
        // find any io connected to this node and disconnect its connection
        const inputConnections = this.connections.filter(
          (c) => c.inputNode.node.id === toDeleteId,
        );
        const outputConnections = this.connections.filter(
          (c) => c.outputNode.node.id === toDeleteId,
        );

        inputConnections.forEach((c) => {
          c.outputNode.node.disconnectIo(
            c.outputNode.ioId,
            { id: toDeleteId, ioId: c.inputNode.ioId },
            'output',
          );
        });
        outputConnections.forEach((c) => {
          c.inputNode.node.disconnectIo(
            c.inputNode.ioId,
            { id: toDeleteId, ioId: c.outputNode.ioId },
            'input',
          );
        });

        this.nodes.splice(nodeIndex, 1);
        return toDeleteId;
      })
      .filter((id) => isDefined(id)) as number[];

    toDetachIds.forEach((id) => this.renderer.detachNode(id));
    this.updateConnections();
  }

  findNode(query: number) {
    return findById(this.nodes, query);
  }

  findOutput(query: number) {
    return findById(this.outputs, query);
  }

  async connectNodes(connection: {
    outputNode: {
      id: number;
      ioId: number;
    };
    inputNode: {
      id: number;
      ioId: number;
    };
  }) {
    const outputNode = this.findNode(connection.outputNode.id);
    const inputNode = this.findNode(connection.inputNode.id);
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
    ) {
      return;
    }
    const c = { ...connection };

    await inputNode.connectInput(
      outputNode,
      c.outputNode.ioId,
      c.inputNode.ioId,
    );
    await outputNode.connectOutput(
      inputNode,
      c.inputNode.ioId,
      c.outputNode.ioId,
    );

    this.updateConnections();
  }

  disconnectNodes(connection: NodeConnectionBreak) {
    // break connections at node level, update runtime connections using object references
    const inputNode = findById(this.nodes, connection.inputNode.id);
    const outputNode = findById(this.nodes, connection.outputNode.id);
    if (inputNode) {
      inputNode.disconnectIo(
        connection.inputNode.ioId,
        connection.outputNode,
        'input',
      );
    }
    if (outputNode) {
      outputNode.disconnectIo(
        connection.outputNode.ioId,
        connection.inputNode,
        'output',
      );
    }
  }

  breakConnection(connection: NodeConnectionBreak) {
    // break connections at node level, update runtime connections using object references
    this.disconnectNodes(connection);
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

  async setNodeIoValue(
    nodeId: number,
    ioId: number,
    value: DefinedIOType,
    kind: NodeIO['kind'],
  ) {
    const node = this.findNode(nodeId);

    valueSetter: {
      if (!node) break valueSetter;
      await node.setIoValue(ioId, value, kind);
    }
    this.updateConnections();
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
