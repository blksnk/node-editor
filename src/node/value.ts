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

export class ObjectValueNode extends Node<['property[]'], ['object']> {
  constructor() {
    super({
      inputs: [defineNodeIO('Properties', 'property[]')],
      outputs: [defineNodeIO('Object', 'object')],
      operation: ([properties]) => {
        // create object from properties
        const normalizePropName = (n: string) => n.replaceAll(' ', '_');
        const object = Object.fromEntries(
          properties.value.map((prop) => [
            normalizePropName(prop.name),
            prop.value,
          ]),
        );
        // inject prop types
        object.__propTypes = Object.fromEntries(
          properties.value.map((prop) => [
            normalizePropName(prop.name),
            prop.type,
          ]),
        );
        return [
          {
            name: 'Object',
            type: 'object',
            value: object,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Object',
      kind: 'value::object',
      type: 'object',
      category: 'value',
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
