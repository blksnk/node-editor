import { Node } from '../../node';
import { NodeOperation } from '../../node.types';
import { defineNodeIO } from '../../defaults';

export class StringPrependNode extends Node<['string', 'string'], ['string']> {
  constructor() {
    const operation: NodeOperation<['string', 'string'], ['string']> = (
      inputs,
    ) => {
      const [string, toPrepend] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value: toPrepend.value + string.value,
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('Base string', 'string', true),
        defineNodeIO('To prepend', 'string', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Prepend',
      category: 'base',
      type: 'string',
      kind: 'string::prepend',
    });
  }
}
