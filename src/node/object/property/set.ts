import { Node } from '../../node';
import { defineNodeIO } from '../../defaults';

export class SetObjectPropertyNode extends Node<
  ['object', 'property'],
  ['object']
> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Object', 'object'),
        defineNodeIO('Property', 'property'),
      ],
      outputs: [defineNodeIO('Object', 'object')],
      operation: ([object, prop]) => {
        const obj = { ...object.value };
        obj[prop.value.name] = prop.value.value;
        obj.__propTypes[prop.value.name] = prop.value.type;
        return [
          {
            name: 'Object',
            type: 'object',
            value: obj,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Set property',
      kind: 'object::property::set',
      type: 'object',
      category: 'base',
    });
  }
}
