import { Node } from '../../node';
import { defineNodeIO } from '../../defaults';

export class MathAbsoluteNode extends Node<['number'], ['number']> {
  constructor() {
    super({
      inputs: [defineNodeIO('Number', 'number', true)],
      outputs: [defineNodeIO('Absolute value', 'number')],
      operation: ([number]) => {
        return [
          {
            name: 'Absolute value',
            type: 'number',
            value: Math.abs(number.value),
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Absolute',
      kind: 'number::math::absolute',
      type: 'number',
      category: 'math',
    });
  }
}
