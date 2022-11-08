import { Node } from '../../node';
import { NodeOperation } from '../../node.types';
import { defineNodeIO } from '../../defaults';

export class StringDeleteNode extends Node<['string', 'string'], ['string']> {
  constructor() {
    const operation: NodeOperation<['string', 'string'], ['string']> = (
      inputs,
    ) => {
      const [string, toDelete] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value: string.value.replace(toDelete.value, ''),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('String', 'string', true),
        defineNodeIO('To delete', 'string', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Delete',
      category: 'base',
      type: 'string',
      kind: 'string::delete',
    });
  }
}
