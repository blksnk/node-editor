import {
  DefinedIOType,
  DefinedIOTypeName,
  IOTypeName,
  IOTypeNamesToNodeIOWithIds,
  NodeCategory,
  NodeIO,
  NodeIODefinition,
  NodeIoToNodeOperationArgument,
  NodeIOWithId,
  NodeOperation,
  NodeTypeName,
  NodeWithId,
} from './node.types';
import { isDefined, isMultiIO, isUndefined } from '../utils/data';
import { AnyGenericNodeKey, AnyNodeKey } from './nodeIndex';
import { Runtime } from '../runtime/runtime';

export class Node<
  InputTypeNames extends IOTypeName[] = DefinedIOTypeName[],
  OutputTypeNames extends IOTypeName[] = DefinedIOTypeName[],
> {
  inputs: IOTypeNamesToNodeIOWithIds<InputTypeNames>;
  outputs: IOTypeNamesToNodeIOWithIds<OutputTypeNames>;
  operation: NodeOperation<InputTypeNames, InputTypeNames>;
  id?: number;
  title = 'Node';
  type: NodeTypeName = 'base';
  category: NodeCategory = 'base';
  kind: AnyNodeKey | AnyGenericNodeKey = 'generic::node';
  runtime?: Runtime;

  constructor({
    inputs,
    outputs,
    operation,
  }: {
    inputs: NodeIODefinition[];
    outputs: NodeIODefinition[];
    operation: NodeOperation<InputTypeNames, OutputTypeNames>;
  }) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.operation = operation;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.inputs = inputs.map((v, i) => ({
      ...v,
      id: i,
      value: v.value ?? undefined,
      kind: 'input',
      node: this,
      editable: v.editable ?? false,
      multi: isMultiIO(v),
      connection: {
        connected: false,
        connections: [],
      },
    }));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.outputs = outputs.map((v, i) => ({
      ...v,
      id: i,
      value: v.value,
      kind: 'output',
      node: this as Node<InputTypeNames, OutputTypeNames>,
      editable: v.editable ?? false,
      multi: isMultiIO(v),
      connection: {
        connected: false,
        connections: [],
      },
    }));
  }

  async fetchInputValues() {
    return await Promise.all(
      this.inputs.map(async (input) => {
        // check if input is connected.
        // return input with default value if not
        if (!input.connection.connections) return input;
        // fetch current connected output value
        const connectedOutputValues = await Promise.all(
          input.connection.connections.map(async ({ node, ioId }) => {
            // always execute node before getting output value
            await node.execute();
            const output: NodeIOWithId | undefined = node.getOutput(ioId);
            if (!output) return undefined;
            return { value: output.value ?? undefined, type: output.type };
          }),
        );
        // filter out unusable connection values
        const filteredOutputValues = connectedOutputValues.filter((output) =>
          isDefined(output),
        );

        // normalize response to fit with input type (array or not)
        // if no node is connected, use input's default value;
        const inputPayload =
          filteredOutputValues.length === 0
            ? { value: input.value, type: input.type }
            : filteredOutputValues.length === 1
              ? filteredOutputValues[0]
              : filteredOutputValues;
        return {
          ...input,
          ...inputPayload,
        };
      }),
    );
  }

  async execute() {
    // fetch all needed inputs from connected nodes
    console.log('execute', this.title);
    const inputs = await this.fetchInputValues();
    // return undefined if some input values are
    if (inputs.some(({ value }) => isUndefined(value))) return undefined;

    // run node operation
    const results = await this.operation(
      inputs as NodeIoToNodeOperationArgument<InputTypeNames>,
    );
    // update node's outputted values
    const r = Array.isArray(results) ? results : [results];
    r.forEach((result) => {
      const index = this.outputs.findIndex(({ name }) => name === result.name);
      if (index < 0) return;
      this.outputs[index].value = result.value;
    });
    // return results for external consumption
    return r;
  }

  assignId(
    id: number,
    runtime: Runtime,
  ): NodeWithId<InputTypeNames, InputTypeNames> {
    this.id = id;
    this.runtime = runtime;
    return this as NodeWithId<InputTypeNames, InputTypeNames>;
  }

  getOutput(query: string | number) {
    return this.outputs.find(
      ({ id, name }) =>
        (typeof query === 'number' && id === query) ||
        (typeof query === 'string' && name === query),
    );
  }

  getInput(query: string | number) {
    return this.inputs.find(
      ({ id, name }) =>
        (typeof query === 'number' && id === query) ||
        (typeof query === 'string' && name === query),
    );
  }

  getIo(query: string | number, kind: NodeIO['kind']) {
    return (kind === 'input' ? this.getInput : this.getOutput).bind(this)(
      query,
    );
  }

  connectInput(
    sourceNode: NodeWithId,
    sourceOutputId: number,
    targetInputQuery: string | number,
  ) {
    const targetInput = this.getInput(targetInputQuery);
    const sourceNodeOutput = sourceNode.getOutput(sourceOutputId);
    if (!targetInput || !sourceNodeOutput) return;

    targetInput.connection.connected = true;
    if (!targetInput.multi) {
      targetInput.connection.connections = [
        {
          node: sourceNode,
          ioId: sourceOutputId,
        },
      ];
    } else {
      targetInput.connection.connections.push({
        node: sourceNode,
        ioId: sourceOutputId,
      });
    }
    this.onOwnIOConnection(targetInput, sourceNodeOutput);
  }

  connectOutput(
    targetNode: NodeWithId,
    targetInputId: number,
    sourceOutputQuery: string | number,
  ) {
    const sourceOutput = this.getOutput(sourceOutputQuery);
    const targetInput = targetNode.getInput(targetInputId);
    if (!sourceOutput || !targetInput) return;
    sourceOutput.connection.connected = true;
    sourceOutput.connection.connections.push({
      node: targetNode,
      ioId: targetInputId,
    });
    this.onOwnIOConnection(sourceOutput, targetInput);
  }

  disconnectIo(
    ownId: number,
    connectionInfo: { id: number; ioId: number },
    kind: 'input' | 'output',
  ) {
    const targetIo = this.getIo(ownId, kind);
    if (!targetIo) return;
    const connectionIndex = targetIo.connection.connections.findIndex(
      (c) => c.node.id === connectionInfo.id && c.ioId === connectionInfo.ioId,
    );
    if (connectionIndex >= 0) {
      targetIo.connection.connections.splice(connectionIndex, 1);
    }
    targetIo.connection.connected = targetIo.connection.connections.length > 0;
  }

  setupSelf(options: {
    type?: NodeTypeName;
    category?: NodeCategory;
    title?: string;
    kind?: AnyNodeKey;
  }) {
    this.type = options.type ?? this.type;
    this.category = options.category ?? this.category;
    this.title = options.title ?? this.title;
    this.kind = options.kind ?? this.kind;
  }

  executeConnectedNodes() {
    console.log('executeConnectedNodes', this.title);
    // run node.execute() on nodes connected to own outputs for them to refresh internal values
    this.outputs.forEach((output) => {
      const { connected, connections } = output.connection;
      if (!connected) return; // exit early if output is not connected
      connections.forEach(async ({ node }) => {
        await node.execute();
        node.executeConnectedNodes();
      });
    });
  }

  async setIoValue(ioId: number, value: DefinedIOType, kind: NodeIO['kind']) {
    const io = this.getIo(ioId, kind);
    valueSetter: {
      if (!io) break valueSetter;
      io.value = value;
      // update self and then nodes connected to own outputs
      await this.execute();
      this.executeConnectedNodes();
    }
    return io;
  }

  async onOwnIOConnection(_ownIO: NodeIOWithId, foreignIO: NodeIOWithId) {
    console.log(
      `${this.title}Node ${this.id}: ${_ownIO.kind} ${_ownIO.id} connected to Foreign Node ${foreignIO.node.id}, ${foreignIO.kind} ${foreignIO.id}`,
    );
    // update connected nodes on input connection change
    if (_ownIO.kind === 'input') {
      await this.execute();
      this.executeConnectedNodes();
    }
  }
}
