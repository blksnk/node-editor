import { defaultValues } from '../defaults';
import { ValueNode } from '../value';

export class StringValueNode extends ValueNode<string, 'string'> {
  constructor() {
    super(defaultValues.string(), 'string');
    this.setupSelf({
      type: 'string',
      kind: 'value::string',
    });
  }
}
