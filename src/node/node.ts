import {
  IOType,
  IOTypeName,
  NodeCategory,
  NodeIODefinition,
  NodeIOWithId,
  NodeOperation,
  NodeOperationArgument,
  NodeTypeName,
  NodeWithId,
} from "./node.types";

export class Node<OperationInputType extends IOType, OperationInputTypeName extends IOTypeName> {
  inputs: NodeIOWithId[];
  outputs: NodeIOWithId[];
  operation: NodeOperation<OperationInputType, OperationInputTypeName>;
  id?: number;
  title = 'Node';
  type: NodeTypeName = 'base';
  category: NodeCategory = 'base';

  constructor({ inputs, outputs, operation }: {
    inputs: NodeIODefinition[],
    outputs: NodeIODefinition[],
    operation: NodeOperation<OperationInputType, OperationInputTypeName>,
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
    }));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.outputs = outputs.map((v, i) => ({
      ...v,
      id: i,
      value: v.value,
      kind: 'output',
      node: this as Node<OperationInputType, OperationInputTypeName>,
    }));
  }

  async fetchInputValues() {
    return await Promise.all(this.inputs.map(async input => {
      // check if input is connected.
      // prioritize connection value over base (default) input value
      if (input.connection?.connected) {
        // fetch current connected output value
        const connectedOutput = input.connection.node.getOutput(input.connection.ioId)
        let outputValue = connectedOutput?.value ?? undefined;
        // execute node if output value is undefined and override var
        if (outputValue === undefined) {
          await input.connection.node.execute()
          outputValue = input.connection.node.getOutput(input.connection.ioId)?.value ?? undefined;
        }
        // return input with value from connected output
        return {
          ...input,
          value: outputValue,
        }
      }
      return input;
    }));
  }

  async execute() {
    // fetch all needed inputs from connected nodes
    const inputs = await this.fetchInputValues();
    // return undefined if some input values are
    if (inputs.some(({ value }) => value === undefined)) return undefined;

    // run node operation
    const results = await this.operation(inputs as unknown as NodeOperationArgument<OperationInputType, OperationInputTypeName>[]);
    // update node's output values 
    const r = Array.isArray(results) ? results : [ results ];
    r.forEach(result => {
      const index = this.outputs.findIndex(({ name }) => name === result.name)
      if (index < 0) return;
      this.outputs[index].value = result.value;
    })
    // return results for external consumption
    return r;
  }

  assignId(id: number): NodeWithId<OperationInputType, OperationInputTypeName> {
    this.id = id;
    return this as NodeWithId<OperationInputType, OperationInputTypeName>;
  }

  getOutput(query: string | number) {
    return this.outputs.find(({
      id,
      name
    }) => (typeof query === 'number' && id === query) || (typeof query === 'string' && name === query));
  }

  getInput(query: string | number) {
    console.log(this, this.inputs)

    return this.inputs.find(({
      id,
      name
    }) => (typeof query === 'number' && id === query) || (typeof query === 'string' && name === query));
  }

  connectInput(sourceNode: NodeWithId<IOType, IOTypeName>, sourceOutputId: number, targetInputQuery: string | number) {
    const targetInput = this.getInput(targetInputQuery);
    const sourceNodeOutput = sourceNode.getOutput(sourceOutputId);
    if (!targetInput || !sourceNodeOutput) return;
    targetInput.connection = {
      connected: true,
      node: sourceNode,
      ioId: sourceOutputId,
    }
    this.onOwnIOConnection(targetInput, sourceNodeOutput);
    sourceNode.onOwnIOConnection(sourceNodeOutput, targetInput)
  }

  connectOutput(targetNode: NodeWithId<IOType, IOTypeName>, targetInputId: number, sourceOutputQuery: string | number) {
    const sourceOutput = this.getOutput(sourceOutputQuery);
    const targetInput = targetNode.getInput(targetInputId);
    if (!sourceOutput || !targetInput) return;
    sourceOutput.connection = {
      connected: true,
      node: targetNode,
      ioId: targetInputId,
    }
    this.onOwnIOConnection(sourceOutput, targetInput)
  }

  disconnectIo(query: string | number, kind: 'input' | 'output') {
    console.log(query, kind)
    const targetIo = (kind === 'input' ? this.getInput : this.getOutput).bind(this)(query);
    if (!targetIo) return;
    targetIo.connection = undefined;
  }

  setupSelf(options: { type?: NodeTypeName, category?: NodeCategory, title?: string }) {
    this.type = options.type ?? this.type;
    this.category = options.category ?? this.category;
    this.title = options.title ?? this.title;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  setValue(_value: OperationInputType) {
  } // blank value setter to be overwritten by some nodes

  onOwnIOConnection(_ownIO: NodeIOWithId, _foreignIO: NodeIOWithId) {
    console.log(`Node ${ this.id }: ${ _ownIO.kind } ${ _ownIO.id } connected to Foreign Node ${ _foreignIO.node.id }, ${ _foreignIO.kind } ${ _foreignIO.id }`)
  } // blank callback to be overwritten by some nodes

}

