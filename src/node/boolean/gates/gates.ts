import { NodeIODefinition, NodeOperation } from '../../node.types';
import { Node } from '../../node';

export class BooleanMathNode extends Node<['boolean', 'boolean'], ['boolean']> {
  constructor(operation: NodeOperation<['boolean', 'boolean'], ['boolean']>) {
    const inputs: NodeIODefinition[] = [
      {
        name: 'A',
        type: 'boolean',
        value: false,
        editable: true,
      },
      {
        name: 'B',
        type: 'boolean',
        value: false,
        editable: true,
      },
    ];
    const outputs: NodeIODefinition[] = [
      {
        name: 'Result',
        type: 'boolean',
      },
    ];
    super({
      inputs,
      outputs,
      operation,
    });
    this.setupSelf({
      type: 'boolean',
      category: 'booleanMath',
    });
  }
}
