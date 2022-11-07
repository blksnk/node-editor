import { Node } from './node';
import {
  DefinedIOType,
  IOTypeName,
  NodeIoToNodeOperationArgument,
} from './node.types';
import { capitalize } from '../utils/strings';
import { defaultValues, defineNodeIO } from './defaults';

export class ValueNode<
  T extends DefinedIOType,
  TN extends IOTypeName,
> extends Node<[], [TN]> {
  constructor(defaultValue: T, type: TN) {
    super({
      inputs: [],
      outputs: [defineNodeIO(capitalize(type), type, true, defaultValue)],
      operation: (): NodeIoToNodeOperationArgument<[TN]> =>
        this.outputs as unknown as NodeIoToNodeOperationArgument<[TN]>,
    });
    this.setupSelf({
      category: 'value',
      title: capitalize(type) + ' Value',
    });
  }
}

export class NumberValueNode extends ValueNode<number, 'number'> {
  constructor() {
    super(defaultValues.number(), 'number');
    this.setupSelf({
      type: 'number',
      kind: 'value::number',
    });
  }
}

export class StringValueNode extends ValueNode<string, 'string'> {
  constructor() {
    super(defaultValues.string(), 'string');
    this.setupSelf({
      type: 'string',
      kind: 'value::string',
    });
  }
}

export class ObjectValueNode extends ValueNode<
  Record<string, DefinedIOType>,
  'object'
> {
  constructor() {
    super(defaultValues.object(), 'object');
    this.setupSelf({
      type: 'object',
      kind: 'value::object',
    });
  }
}

export class BooleanValueNode extends ValueNode<boolean, 'boolean'> {
  constructor() {
    super(defaultValues.boolean(), 'boolean');
    this.setupSelf({
      type: 'boolean',
      kind: 'value::boolean',
    });
  }
}
