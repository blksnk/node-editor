import { Node } from './node';
import { defineNodeIO } from './defaults';
import {
  DefinedIOType,
  IOType,
  IOTypeName,
  NodeIO,
  NodeIOWithId,
} from './node.types';
import { isUndefined } from '../utils/data';

export class RuntimeOutputNode extends Node<['string', 'any'], []> {
  constructor() {
    super({
      outputs: [],
      inputs: [
        defineNodeIO('Name', 'string', true, 'New Output'),
        defineNodeIO('Value', 'any'),
      ],
      operation: ([name, value]) => {
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

  override async setIoValue(
    ioId: number,
    value: DefinedIOType,
    kind: NodeIO['kind'],
  ) {
    const io = await super.setIoValue(ioId, value, kind);
    if (isUndefined(io)) return io;
    if (io.name === 'Name' && typeof io.value === 'string') {
      this.updateOwnName(io.value);
    }
    return io;
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

  // override async onOwnIOConnection(
  //   _ownIO: NodeIOWithId,
  //   foreignIO: NodeIOWithId,
  // ): Promise<void> {
  //   await this.execute();
  //   super.onOwnIOConnection(_ownIO, foreignIO);
  // }

  override async onOwnInputDisconnection(_ownIO: NodeIOWithId): Promise<void> {
    super.onOwnInputDisconnection(_ownIO);
    if (_ownIO.name === 'Value') {
      this.updateOwnValue(_ownIO.value, _ownIO.type);
    }
  }
}
