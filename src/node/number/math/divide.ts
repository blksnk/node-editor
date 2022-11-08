import { NodeOperation } from '../../node.types';
import { MathNode } from './math';

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
