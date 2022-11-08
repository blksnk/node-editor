import { defaultValues } from '../defaults';
import { ValueNode } from '../value';

export class BooleanValueNode extends ValueNode<boolean, 'boolean'> {
  constructor() {
    super(defaultValues.boolean(), 'boolean');
    this.setupSelf({
      type: 'boolean',
      kind: 'value::boolean',
    });
  }
}
