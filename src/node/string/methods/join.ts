import { Node } from '../../node';
import { NodeOperation } from '../../node.types';
import { defineNodeIO } from '../../defaults';

export class StringJoinNode extends Node<['string[]', 'string'], ['string']> {
  constructor() {
    const operation: NodeOperation<['string[]', 'string'], ['string']> = (
      inputs,
    ) => {
      const [strings, joinWith] = inputs;
      console.log(inputs);
      return [
        {
          name: 'String',
          type: 'string',
          value: strings.value.join(joinWith.value),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('Strings', 'string[]', true),
        defineNodeIO('Join With', 'string', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Join',
      category: 'base',
      type: 'string',
      kind: 'string::join',
    });
  }
}
