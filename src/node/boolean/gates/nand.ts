import { NodeOperation } from '../../node.types';
import { BooleanMathNode } from './gates';

export class NandBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      a,
      b,
    ]) => {
      return [
        {
          name: 'Result',
          type: 'boolean',
          value: !(a.value && b.value),
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Not And Gate',
      kind: 'booleanmath::nand',
    });
  }
}
