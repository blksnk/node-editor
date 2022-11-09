import { Node } from '../../node';
import { defineNodeIO } from '../../defaults';

export class GetObjectPropertyValueNode extends Node<['property'], ['any']> {
  constructor() {
    super({
      inputs: [defineNodeIO('Property', 'property')],
      outputs: [defineNodeIO('Property value', 'any')],
      operation: ([property]) => {
        return [
          {
            name: 'Property value',
            type: 'any',
            value: property.value.value,
            tempType: property.value.type,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Property value',
      kind: 'object::property::value',
      type: 'any',
      category: 'base',
    });
  }
}
