import { defaultValues } from '../defaults';
import { ValueNode } from '../value';

export class NumberValueNode extends ValueNode<number, 'number'> {
  constructor() {
    super(defaultValues.number(), 'number');
    this.setupSelf({
      type: 'number',
      kind: 'value::number',
    });
  }
}
