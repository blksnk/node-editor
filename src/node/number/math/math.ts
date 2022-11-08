import { NodeIODefinition, NodeOperation } from '../../node.types';
import { Node } from '../../node';
import { defaultValues, defineNodeIO } from '../../defaults';

export class MathNode extends Node<['number', 'number'], ['number']> {
  constructor(operation: NodeOperation<['number', 'number'], ['number']>) {
    const inputs: NodeIODefinition[] = [
      defineNodeIO('A', 'number', true, 0),
      defineNodeIO('B', 'number', true, 0),
    ];
    const outputs: NodeIODefinition[] = [
      defineNodeIO('Result', 'number', false, defaultValues.undef()),
    ];
    super({
      inputs,
      outputs,
      operation,
    });
    this.setupSelf({
      type: 'number',
      category: 'math',
    });
  }
}
