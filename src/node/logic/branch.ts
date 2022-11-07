import { Node } from '../node';
import { defineNodeIO } from '../defaults';

export class BranchLogicNode extends Node<['boolean', 'any', 'any'], ['any']> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Condition', 'boolean', true),
        defineNodeIO('True', 'any', true),
        defineNodeIO('False', 'any', true),
      ],
      outputs: [defineNodeIO('Result', 'any', false)],
      operation: ([condition, ifTrue, ifFalse]) => {
        return [
          {
            name: 'False',
            type: 'any',
            value: condition.value ? ifTrue.value : ifFalse.value,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Branch',
      type: 'any',
      category: 'logic',
      kind: 'logic::branch',
    });
  }
}
