import { Node } from '../../node';
import { defineNodeIO } from '../../defaults';

export class DeleteObjectPropertyNode extends Node<
  ['object', 'string'],
  ['object']
> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Object', 'object'),
        defineNodeIO('Property name', 'string', true, 'prop'),
      ],
      outputs: [defineNodeIO('Object', 'object')],
      operation: ([object, propName]) => {
        const obj = { ...object.value };
        delete obj[propName.value];
        delete obj.__propTypes[propName.value];
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
      title: 'Delete property',
      kind: 'object::property::delete',
      type: 'object',
      category: 'base',
    });
  }
}
