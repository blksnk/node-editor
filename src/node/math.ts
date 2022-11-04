import {
 NodeIODefinition,
  NodeOperation,
  NodeOperationArgument
} from "./node.types";
import { Node } from "./node";

export class MathNode extends Node<number, 'number'> {
  constructor(operation: NodeOperation<number, 'number'>) {
    const inputs: NodeIODefinition[] = [
      {
        name: "A",
        type: 'number',
        value: 0,
      },
      {
        name: "B",
        type: 'number',
        value: 0,
      }
    ]
    const outputs: NodeIODefinition[] = [
      {
        name: 'Result',
        type: 'number',
      }
    ]
    super({
      inputs, outputs, operation,
    })
    this.setupSelf({
      type: 'number',
      category: 'math',
    })
  }
}

export class AddMathNode extends MathNode {
  constructor() {
    const operation: NodeOperation<number, 'number'> = (inputs: NodeOperationArgument<number, 'number'>[]) => {
      const a = inputs[0];
      const b = inputs[1];
      return {
        name: 'Result',
        type: 'number',
        value: a.value + b.value
      }
    }
    super(operation);
    this.setupSelf({
      title: 'Add'
    })
  }
}

export class SubtractMathNode extends MathNode {
  constructor() {
    const operation: NodeOperation<number, 'number'> = (inputs: NodeOperationArgument<number, 'number'>[]) => {
      const a = inputs[0];
      const b = inputs[1];
      return {
        name: 'Result',
        type: 'number',
        value: a.value - b.value
      }
    }
    super(operation);
    this.setupSelf({
      title: 'Subtract'
    })
  }
}

export class MultiplyMathNode extends MathNode {
  constructor() {
    const operation: NodeOperation<number, 'number'> = (inputs: NodeOperationArgument<number, 'number'>[]) => {
      const a = inputs[0];
      const b = inputs[1];
      return {
        name: 'Result',
        type: 'number',
        value: a.value * b.value
      }
    }
    super(operation);
    this.setupSelf({
      title: 'Multiply'
    })
  }
}

export class DivideMathNode extends MathNode {
  constructor() {
    const operation: NodeOperation<number, 'number'> = (inputs: NodeOperationArgument<number, 'number'>[]) => {
      const a = inputs[0];
      const b = inputs[1];
      return {
        name: 'Result',
        type: 'number',
        value: a.value / b.value
      }
    }
    super(operation);
    this.setupSelf({
      title: 'Divide'
    })
  }
}
