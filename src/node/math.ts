import { NodeIODefinition, NodeOperation } from './node.types';
import { Node } from './node';
import { defaultValues, defineNodeIO } from './defaults';

export class MathNode extends Node<['number', 'number'], ['number']> {
  constructor(operation: NodeOperation<['number', 'number'], ['number']>) {
    const inputs: NodeIODefinition[] = [
      defineNodeIO('A', 'number', true, 0),
      defineNodeIO('B', 'number', true, 0),
    ];
    const outputs: NodeIODefinition[] = [
      defineNodeIO('Result', 'number', false, defaultValues.undef()),
    ];
    super({
      inputs,
      outputs,
      operation,
    });
    this.setupSelf({
      type: 'number',
      category: 'math',
    });
  }
}

export class AddMathNode extends MathNode {
  constructor() {
    const operation: NodeOperation<['number', 'number'], ['number']> = (
      inputs,
    ) => {
      const a = inputs[0];
      const b = inputs[1];
      return [
        {
          name: 'Result',
          type: 'number',
          value: a.value + b.value,
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Add',
      kind: 'math::add',
    });
  }
}

export class SubtractMathNode extends MathNode {
  constructor() {
    const operation: NodeOperation<['number', 'number'], ['number']> = (
      inputs,
    ) => {
      const a = inputs[0];
      const b = inputs[1];
      return [
        {
          name: 'Result',
          type: 'number',
          value: a.value - b.value,
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Subtract',
      kind: 'math::subtract',
    });
  }
}

export class MultiplyMathNode extends MathNode {
  constructor() {
    const operation: NodeOperation<['number', 'number'], ['number']> = (
      inputs,
    ) => {
      const a = inputs[0];
      const b = inputs[1];
      return [
        {
          name: 'Result',
          type: 'number',
          value: a.value * b.value,
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Multiply',
      kind: 'math::multiply',
    });
  }
}

export class DivideMathNode extends MathNode {
  constructor() {
    const operation: NodeOperation<['number', 'number'], ['number']> = (
      inputs,
    ) => {
      const a = inputs[0];
      const b = inputs[1];
      return [
        {
          name: 'Result',
          type: 'number',
          value: a.value / b.value,
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Divide',
      kind: 'math::divide',
    });
  }
}
