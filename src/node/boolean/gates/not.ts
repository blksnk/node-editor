import { Node } from '../../node';
import { NodeIODefinition, NodeOperation } from '../../node.types';

export class NotBooleanMathNode extends Node<
  ['boolean', 'boolean'],
  ['boolean']
> {
  constructor() {
    const inputs: NodeIODefinition[] = [
      {
        name: 'Value',
        type: 'boolean',
        value: 0,
      },
    ];
    const outputs: NodeIODefinition[] = [
      {
        name: 'Inverse',
        type: 'boolean',
      },
    ];
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      v,
    ]) => {
      return [
        {
          name: 'Inverse',
          type: 'boolean',
          value: !v.value,
        },
      ];
    };
    super({
      inputs,
      outputs,
      operation,
    });
    this.setupSelf({
      type: 'boolean',
      category: 'boolean',
      title: 'Not Gate',
      kind: 'boolean::math::not',
    });
  }
}
