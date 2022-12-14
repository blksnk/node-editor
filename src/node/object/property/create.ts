import { Node } from '../../node';
import { defineNodeIO } from '../../defaults';
import { DefinedIOType, DefinedIOTypeName } from '../../node.types';

export class CreateObjectPropertyNode extends Node<
  ['string', 'any'],
  ['property']
> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Property name', 'string', true, 'prop'),
        defineNodeIO('Property value', 'any'),
      ],
      outputs: [defineNodeIO('Property', 'property')],
      operation: ([propName, propValue]) => {
        const value = Array.isArray(propValue.value)
          ? propValue.value.map(({ value }) => value)
          : propValue.value;
        return [
          {
            name: 'Property',
            type: 'property',
            value: {
              kind: 'property',
              name: propName.value,
              value: value as DefinedIOType,
              type: propValue.type as DefinedIOTypeName,
            },
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Create Property',
      type: 'property',
      category: 'base',
      kind: 'object::property::create',
    });
  }
}
