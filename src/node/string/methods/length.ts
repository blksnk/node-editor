import { Node } from '../../node';
import { NodeOperation } from '../../node.types';
import { defineNodeIO } from '../../defaults';

export class StringLengthNode extends Node<['string'], ['number']> {
  constructor() {
    const operation: NodeOperation<['string'], ['number']> = (inputs) => {
      const s = inputs[0];
      return [
        {
          name: 'Length',
          type: 'number',
          value: s.value.length,
        },
      ];
    };
    super({
      inputs: [defineNodeIO('String', 'string', true)],
      outputs: [defineNodeIO('Length', 'number', false, 0)],
      operation,
    });
    this.setupSelf({
      title: 'String Length',
      category: 'base',
      type: 'string',
      kind: 'string::length',
    });
  }
}
