import { Node } from '../../node';
import { NodeOperation } from '../../node.types';
import { defineNodeIO } from '../../defaults';

export class StringDeleteAtNode extends Node<
  ['string', 'number', 'number'],
  ['string']
> {
  constructor() {
    const operation: NodeOperation<
      ['string', 'number', 'number'],
      ['string']
    > = (inputs) => {
      const [string, startIndex, endIndex] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value:
            string.value.substring(0, startIndex.value) +
            string.value.substring(endIndex.value + 1),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('String', 'string', true),
        defineNodeIO('Start index', 'number', true),
        defineNodeIO('End index', 'number', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Delete At',
      category: 'base',
      type: 'string',
      kind: 'string::deleteat',
    });
  }
}
