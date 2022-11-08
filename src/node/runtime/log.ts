import { Node } from '../node';
import { defineNodeIO } from '../defaults';

export class RuntimeLogNode extends Node<['any', 'string'], ['any']> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Value', 'any'),
        defineNodeIO('Name', 'string', true, 'Log'),
      ],
      outputs: [defineNodeIO('Value', 'any')],
      operation: ([value, name]) => {
        console.log(`${name.value}: `, value);
        return [value];
      },
    });
    this.setupSelf({
      title: 'Log to console',
      category: 'runtime',
      type: 'any',
      kind: 'runtime::log',
    });
  }
}
