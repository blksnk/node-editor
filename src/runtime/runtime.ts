import { Node } from "../node/node";
import { IOType, IOTypeName, NodeWithId } from "../node/node.types";
import { Renderer } from "../renderer/renderer";
import {
  AnyNodeKey,
  BooleanMathNodeIndex,
  isBooleanMathNodeKey,
  isMathNodeKey,
  isValueNodeKey,
  MathNodeIndex,
  ValueNodeIndex
} from "../node/nodeIndex";
import {
  NodeConnection,
  NodeConnectionAttempt,
  NodeConnectionBreak
} from "./runtime.types";
import { getUniqueConnections } from "../renderer/connection";
import { findById } from "../utils/data";

export class Runtime {
  nodes: NodeWithId<IOType, IOTypeName>[] = [];
  connections: NodeConnection[] = [];
  nextNodeId: number = 0;
  renderer: Renderer;

  constructor() {
    this.renderer = new Renderer({
      target: document.body,
      runtime: this,
    })
  }

  registerNode(node: Node<IOType, IOTypeName>) {
    const withId = node.assignId(this.nextNodeId);
    this.nextNodeId++;
    this.nodes.push(withId);
    this.renderer.attachNode(withId);
    this.updateConnections()
  }

  updateConnections() {
    this.connections = getUniqueConnections(this.nodes);
    this.renderer.updateConnections(this.connections)
  }

  createNode(k: AnyNodeKey) {
    let node;
    if(isMathNodeKey(k)) {
      node = new MathNodeIndex[k]()
    }
    else if(isValueNodeKey(k)) {
      node = new ValueNodeIndex[k]()
    }
    else if(isBooleanMathNodeKey(k)) {
      // @ts-ignore
      node = new BooleanMathNodeIndex[k]()
    }
    if(node instanceof Node) {
      this.registerNode(node);
    }
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
    if(outputNode === undefined || inputNode === undefined ) return;

    const inputIo = findById(inputNode.inputs, connection.inputNode.ioId);
    const outputIo = findById(outputNode.outputs, connection.outputNode.ioId);
    if(inputIo === undefined || outputIo === undefined ) return;

    if(!this.checkConnectionAttempt({
      inputNode: {
        ...connection.inputNode,
        type: inputIo.type,
      },
      outputNode: {
        ...connection.outputNode,
        type: outputIo.type,
      }
    })) return;

    inputNode.connectInput(outputNode, connection.outputNode.ioId, connection.inputNode.ioId);
    outputNode.connectOutput(inputNode, connection.inputNode.ioId, connection.outputNode.ioId);

    this.updateConnections();
  }

  breakConnection(connection: NodeConnectionBreak) {
    // break connections at node level, update runtime connections using object references
    const inputNode = findById(this.nodes, connection.inputNode.id);
    const outputNode = findById(this.nodes, connection.outputNode.id);
    if (!inputNode || !outputNode) return;
    console.log(inputNode, outputNode, connection)
    inputNode.disconnectIo(connection.inputNode.ioId, 'input')
    outputNode.disconnectIo(connection.outputNode.ioId, 'output')
    this.updateConnections();
  }

  checkConnectionAttempt(candidate: NodeConnectionAttempt): boolean {
    const typeValid = candidate.inputNode.type === candidate.outputNode.type;
    const notSameNode = candidate.inputNode.id !== candidate.outputNode.id;
    console.log({
      candidate,
      typeValid, notSameNode
    })
    return typeValid && notSameNode;
  }
}