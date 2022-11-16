import { Node } from '../../node';
import { defineNodeIO } from '../../defaults';

export class MathInvertNode extends Node<['number'], ['number']> {
  constructor() {
    super({
      inputs: [defineNodeIO('Number', 'number', true)],
      outputs: [defineNodeIO('Inverted', 'number')],
      operation: ([number]) => {
        return [
          {
            name: 'Inverted',
            type: 'number',
            value: number.value * -1,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Invert',
      kind: 'number::math::invert',
      type: 'number',
      category: 'math',
    });
  }
}
