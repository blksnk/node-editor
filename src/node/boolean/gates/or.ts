import { NodeOperation } from '../../node.types';
import { BooleanMathNode } from './gates';

export class OrBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      a,
      b,
    ]) => {
      return [
        {
          name: 'Result',
          type: 'boolean',
          value: a.value || b.value,
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Or Gate',
      kind: 'boolean::math::or',
    });
  }
}
