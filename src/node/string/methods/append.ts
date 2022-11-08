import { Node } from '../../node';
import { NodeOperation } from '../../node.types';
import { defineNodeIO } from '../../defaults';

export class StringAppendNode extends Node<['string', 'string'], ['string']> {
  constructor() {
    const operation: NodeOperation<['string', 'string'], ['string']> = (
      inputs,
    ) => {
      const [string, toAppend] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value: string.value + toAppend.value,
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('Base string', 'string', true),
        defineNodeIO('To append', 'string', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Append',
      category: 'base',
      type: 'string',
      kind: 'string::append',
    });
  }
}
