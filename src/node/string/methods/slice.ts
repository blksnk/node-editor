import { Node } from '../../node';
import { NodeOperation } from '../../node.types';
import { defineNodeIO } from '../../defaults';

export class StringSliceNode extends Node<
  ['string', 'number', 'number'],
  ['string']
> {
  constructor() {
    const operation: NodeOperation<
      ['string', 'number', 'number'],
      ['string']
    > = (inputs) => {
      const [s, startIndex, endIndex] = inputs;
      return [
        {
          name: 'Slice',
          type: 'string',
          value: s.value.slice(startIndex.value, endIndex.value),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('String', 'string', true),
        defineNodeIO('Start Index', 'number', true, 0),
        defineNodeIO('End Index', 'number', true, 3),
      ],
      outputs: [defineNodeIO('Slice', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Slice',
      category: 'base',
      type: 'string',
      kind: 'string::slice',
    });
  }
}
