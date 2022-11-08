import { Node } from '../node';
import { defineNodeIO } from '../defaults';
import { isUndefined } from '../../utils/data';
import { IOType, IOTypeName, NodeIOWithId } from '../node.types';

export class RuntimeOutputNode extends Node<['string', 'any'], []> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Name', 'string', true, 'New Output'),
        defineNodeIO('Value', 'any'),
      ],
      outputs: [],
      operation: ([name, value]) => {
        console.log(value);
        this.updateOwnName(name.value);
        this.updateOwnValue(value.value, value.type);
        return [];
      },
    });
    this.setupSelf({
      title: 'Output',
      category: 'runtime',
      type: 'any',
      kind: 'runtime::output',
    });
  }

  updateOwnName(name: string) {
    if (!this.runtime || isUndefined(this.id)) return;
    this.runtime.updateOutput(this.id, { name });
  }

  updateOwnValue(value: IOType, type: IOTypeName) {
    if (!this.runtime || isUndefined(this.id)) return;
    this.runtime.updateOutput(this.id, {
      value,
      type,
    });
  }

  override async executeConnectedNodes() {
    await this.execute();
    super.executeConnectedNodes();
  }

  override async onOwnInputDisconnection(_ownIO: NodeIOWithId): Promise<void> {
    super.onOwnInputDisconnection(_ownIO);
    if (_ownIO.name === 'Value') {
      this.updateOwnValue(_ownIO.value, _ownIO.type);
    }
  }
}
