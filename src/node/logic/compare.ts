import { Node } from '../node';
import { defineNodeIO } from '../defaults';

export class LogicCompareNode extends Node<['any', 'any'], ['boolean']> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('A', 'any', false),
        defineNodeIO('B', 'any', false),
      ],
      outputs: [defineNodeIO('Result', 'boolean', false)],
      operation: ([a, b]) => {
        return [
          {
            name: 'Result',
            type: 'boolean',
            value: a.value === b.value,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Compare',
      type: 'boolean',
      kind: 'logic::compare',
      category: 'logic',
    });
  }
}
