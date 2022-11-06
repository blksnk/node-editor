import { Node } from './node';
import { DefinedIOType, IOTypeName } from './node.types';
import { capitalize } from '../utils/strings';
import { defaultValues } from './defaults';

export class ValueNode<
  T extends DefinedIOType,
  TN extends IOTypeName,
> extends Node<DefinedIOType, IOTypeName> {
  constructor(defaultValue: T, type: TN) {
    super({
      inputs: [],
      outputs: [
        {
          name: 'Value',
          type,
          value: defaultValue,
          editable: true,
        },
      ],
      operation: () => this.outputs[0],
    });
    this.setupSelf({
      category: 'value',
      title: capitalize(type) + ' Value',
    });
  }
}

export class NumberValueNode extends ValueNode<number, 'number'> {
  constructor() {
    super(defaultValues.number, 'number');
    this.setupSelf({
      type: 'number',
    });
  }
}

export class StringValueNode extends ValueNode<string, 'string'> {
  constructor() {
    super(defaultValues.string, 'string');
    this.setupSelf({
      type: 'string',
    });
  }
}

export class ObjectValueNode extends ValueNode<
  Record<string, DefinedIOType>,
  'object'
> {
  constructor() {
    super(defaultValues.object, 'object');
    this.setupSelf({
      type: 'object',
    });
  }
}

export class BooleanValueNode extends ValueNode<boolean, 'boolean'> {
  constructor() {
    super(defaultValues.boolean, 'boolean');
    this.setupSelf({
      type: 'boolean',
    });
  }
}
