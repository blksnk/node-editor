import { Node } from '../../node';
import { NodeOperation } from '../../node.types';
import { defineNodeIO } from '../../defaults';

export class StringReplaceNode extends Node<
  ['string', 'string', 'string', 'boolean'],
  ['string']
> {
  constructor() {
    const operation: NodeOperation<
      ['string', 'string', 'string', 'boolean'],
      ['string']
    > = (inputs) => {
      const [s, toReplace, replaceBy, replaceAll] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value: (replaceAll.value ? s.value.replaceAll : s.value.replace)(
            toReplace.value,
            replaceBy.value,
          ),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('Base string', 'string', true),
        defineNodeIO('To replace', 'string', true),
        defineNodeIO('Replace by', 'string', true),
        defineNodeIO('Replace all', 'boolean', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Replace',
      category: 'base',
      type: 'string',
      kind: 'string::replace',
    });
  }
}
