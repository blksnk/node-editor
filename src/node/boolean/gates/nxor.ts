import { NodeOperation } from '../../node.types';
import { BooleanMathNode } from './gates';

export class XNorBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      a,
      b,
    ]) => {
      return [
        {
          name: 'Result',
          type: 'boolean',
          value: a.value === b.value,
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Exclusive Nor Gate',
      kind: 'booleanmath::xnor',
    });
  }
}
