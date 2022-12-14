import {
  DefinedIOType,
  IOType,
  IOTypeName,
  IOTypeNamesToNodeIOWithIds,
  NodeCategory,
  NodeInitialOutputTypes,
  NodeIO,
  NodeIODefinition,
  NodeIoToNodeOperationArgument,
  NodeIoToNodeOperationReturnValue,
  NodeIOWithId,
  NodeOperation,
  NodeOperationReturnValue,
  NodeTypeName,
  NodeWithId,
} from './node.types';
import {
  findById,
  isAnyType,
  isDefined,
  isMultiIO,
  isUndefined,
} from '../utils/data';
import { AnyGenericNodeKey, AnyNodeKey } from './nodeIndex';
import { Runtime } from '../runtime/runtime';
import { NodeTitles } from './nodeTitles';

export class Node<
  InputTypeNames extends IOTypeName[] = IOTypeName[],
  OutputTypeNames extends IOTypeName[] = IOTypeName[],
> {
  inputs: IOTypeNamesToNodeIOWithIds<InputTypeNames>;
  outputs: IOTypeNamesToNodeIOWithIds<OutputTypeNames>;
  operation: NodeOperation<InputTypeNames, OutputTypeNames>;
  id?: number;
  title = 'Node';
  type: NodeTypeName = 'base';
  category: NodeCategory = 'base';
  kind: AnyNodeKey | AnyGenericNodeKey = 'generic::node';
  runtime?: Runtime;
  initialOutputTypes: NodeInitialOutputTypes<OutputTypeNames>;

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

    // store initial output types
    this.initialOutputTypes = this.outputs.map(({ type, id }) => ({
      initialType: type,
      id,
    })) as unknown as NodeInitialOutputTypes<OutputTypeNames>;
  }

  public async execute() {
    // fetch all needed inputs from connected nodes
    console.log('execute', this.title);
    const inputs = await this.fetchInputValues();
    // return undefined if some input values are
    if (inputs.some(({ value }) => isUndefined(value))) return undefined;

    // run node operation
    const results: NodeIoToNodeOperationReturnValue<OutputTypeNames> =
      await this.operation(
        inputs as NodeIoToNodeOperationArgument<InputTypeNames>,
      );

    // update node's outputted values
    const r = Array.isArray(results) ? results : [results];
    r.forEach((result: NodeOperationReturnValue<IOType, IOTypeName>) => {
      const index = this.outputs.findIndex(({ name }) => name === result.name);
      if (index < 0) return;
      this.outputs[index].value = result.value;
      if (result.type === 'any' || result.type === 'any[]') {
        this.outputs[index].type = result.tempType;
      }
    });
    // return results for external consumption
    return r;
  }

  public assignId(
    id: number,
    runtime: Runtime,
  ): NodeWithId<InputTypeNames, OutputTypeNames> {
    this.id = id;
    this.runtime = runtime;
    return this as NodeWithId<InputTypeNames, OutputTypeNames>;
  }

  public getIo(query: string | number, kind: NodeIO['kind']) {
    return (kind === 'input' ? this.getInput : this.getOutput).bind(this)(
      query,
    );
  }

  public async connectInput(
    sourceNode: NodeWithId,
    sourceOutputId: number,
    targetInputQuery: string | number,
  ) {
    const targetInput = this.getInput(targetInputQuery);
    const sourceNodeOutput = sourceNode.getOutput(sourceOutputId);
    if (!targetInput || !sourceNodeOutput) return;
    targetInput.connection.connected = true;
    if (!targetInput.multi) {
      // remove connected status from previously connected output
      const previousConnection = targetInput.connection.connections[0];
      if (previousConnection) {
        previousConnection.node.disconnectIo(
          previousConnection.ioId,
          {
            id: this.id as number,
            ioId: targetInput.id,
          },
          'output',
        );
      }
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
    await this.onOwnIOConnection(targetInput, sourceNodeOutput);
  }

  public async connectOutput(
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
    await this.onOwnIOConnection(sourceOutput, targetInput);
  }

  public disconnectIo(
    ownIoId: number,
    connectionInfo: { id: number; ioId: number },
    kind: 'input' | 'output',
  ) {
    const targetIo = this.getIo(ownIoId, kind);
    console.log(targetIo?.name);
    if (!targetIo) return;
    const connectionIndex = targetIo.connection.connections.findIndex(
      (c) => c.node.id === connectionInfo.id && c.ioId === connectionInfo.ioId,
    );
    if (connectionIndex >= 0) {
      targetIo.connection.connections.splice(connectionIndex, 1);
    }
    targetIo.connection.connected = targetIo.connection.connections.length > 0;
    if (kind === 'input') {
      this.onOwnInputDisconnection(targetIo);
    }
  }

  public async setIoValue(
    ioId: number,
    value: DefinedIOType,
    kind: NodeIO['kind'],
    executeConnected = true,
  ) {
    const io = this.getIo(ioId, kind);
    valueSetter: {
      if (!io) break valueSetter;
      io.value = value;
      // update self and then nodes connected to own outputs
      if (executeConnected) {
        await this.executeConnectedNodes();
      }
    }
    return io;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onOwnIOConnection(_ownIO: NodeIOWithId, _foreignIO: NodeIOWithId) {
    // console.log(
    //   `${this.title}Node ${this.id}: ${_ownIO.kind} ${_ownIO.id} connected to Foreign ${foreignIO.node.title} Node ${foreignIO.node.id}, ${foreignIO.kind} ${foreignIO.id}`,
    // );
    // update connected nodes on input connection change
    if (_ownIO.kind === 'input') {
      await this.executeConnectedNodes();
    }
  }

  public getOutputType = (query: string | number): IOTypeName | undefined => {
    const output = this.getOutput(query);
    if (!output) return undefined;
    return output.type;
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async updateOutputTypes() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  protected resetOutputTypes() {
    this.outputs.forEach((o) => {
      const initial = findById(this.initialOutputTypes, o.id);
      o.type = initial?.initialType ?? o.type;
    });
  }

  protected async fetchInputValues() {
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
            const output = node.getOutput(ioId);
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
            : filteredOutputValues.length === 1 &&
              (!input.multi || input.type === 'any')
              ? filteredOutputValues[0]
              : {
                type: input.type,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                value: filteredOutputValues.map(({ value }) => value).flat(1), // flatten array if multiple inputs connected and some of them are arrays
              };
        return {
          ...input,
          ...inputPayload,
        };
      }),
    );
  }

  protected getOutput(query: string | number) {
    return this.outputs.find(
      ({ id, name }) =>
        (typeof query === 'number' && id === query) ||
        (typeof query === 'string' && name === query),
    );
  }

  protected getInput(query: string | number) {
    return this.inputs.find(
      ({ id, name }) =>
        (typeof query === 'number' && id === query) ||
        (typeof query === 'string' && name === query),
    );
  }

  protected setupSelf(options: {
    type?: NodeTypeName;
    category?: NodeCategory;
    title?: string;
    kind?: AnyNodeKey;
  }) {
    this.type = options.type ?? this.type;
    this.category = options.category ?? this.category;
    this.kind = options.kind ?? this.kind;
    this.title = options.title ?? NodeTitles[this.kind] ?? this.title;
  }

  protected async executeConnectedNodes() {
    if (this.inputs.length > 0) {
      console.log(this.title, 'update output');
      await this.updateOutputTypes();
    }
    // console.log('executeConnectedNodes', this.title);
    // run node.execute() on nodes connected to own outputs for them to refresh internal values
    this.outputs.forEach((output) => {
      const { connected, connections } = output.connection;
      if (!connected) return; // exit early if output is not connected
      connections.forEach(async ({ node }) => {
        node.executeConnectedNodes();
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onOwnInputDisconnection(_ownIO: NodeIOWithId) {
    // TODO: reset any overrided output types with initial types
    if (isAnyType(_ownIO.type)) {
      this.resetOutputTypes();
    }
    // console.log('Disconnected own input ', _ownIO.id);
  }

  // recursive search through connected nodes inputs to find node with a specific kind
  protected getSpecificInputNode(
    kind: AnyNodeKey,
  ): Node<IOTypeName[], IOTypeName[]> | undefined {
    const isSearchedKind = (n: Node<IOTypeName[], IOTypeName[]> | undefined) =>
      isDefined(n) && n.kind === kind;
    const thisNode = this as Node<IOTypeName[], IOTypeName[]>;
    if (isSearchedKind(thisNode)) return thisNode;
    if (this.inputs.length === 0) return undefined;

    const inputNodes = thisNode.inputs
      .filter((i) => i.connection.connected)
      .map(({ connection }) =>
        connection.connections.map(({ node }) =>
          node.getSpecificInputNode(kind),
        ),
      )
      .flat(1);
    return inputNodes.find((n) => isSearchedKind(n));
  }
}
