import { Node } from '../node';
import { defineNodeIO } from '../defaults';
import { NodeIO } from '../node.types';

export class CurrentIndexLogicNode extends Node<[], ['number']> {
  constructor() {
    super({
      inputs: [],
      outputs: [defineNodeIO('Current index', 'number', false, -1)],
      operation: () => {
        // increment output value for consecutive calls
        return [
          {
            name: 'Current index',
            type: 'number',
            value: this.outputs[0].value + 1,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Current index',
      type: 'number',
      category: 'logic',
      kind: 'logic::currentindex',
    });
  }

  async setIoValue(ioId: number, value: number, kind: NodeIO['kind']) {
    return super.setIoValue(ioId, value, kind, false);
  }
}
