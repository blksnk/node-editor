import { Node } from '../node';
import { defineNodeIO } from '../defaults';
import { deepMerge, simpleMerge } from '../../utils/merge';
import { ObjectIOType } from '../node.types';

export class ObjectMergeNode extends Node<['object[]', 'boolean'], ['object']> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Objects', 'object[]'),
        defineNodeIO('Deep merge', 'boolean', true),
      ],
      outputs: [defineNodeIO('Merged object', 'object')],
      operation: ([objects, deep]) => {
        const obj = deep.value
          ? deepMerge(...objects.value)
          : simpleMerge(...objects.value);
        console.log(obj);
        return [
          {
            name: 'Merged object',
            type: 'object',
            value: obj as ObjectIOType,
          },
        ];
      },
    });
    this.setupSelf({
      kind: 'object::merge',
      category: 'base',
      type: 'object',
      title: 'Merge Objects',
    });
  }
}
