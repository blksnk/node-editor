import { Node } from './node';
import {
  DefinedIOType,
  IOTypeName,
  NodeIoToNodeOperationArgument,
} from './node.types';
import { capitalize } from '../utils/strings';
import { defineNodeIO } from './defaults';

export class ValueNode<
  T extends DefinedIOType,
  TN extends IOTypeName,
> extends Node<[], [TN]> {
  constructor(defaultValue: T, type: TN) {
    super({
      inputs: [],
      outputs: [defineNodeIO(capitalize(type), type, true, defaultValue)],
      operation: (): NodeIoToNodeOperationArgument<[TN]> =>
        this.outputs as unknown as NodeIoToNodeOperationArgument<[TN]>,
    });
    this.setupSelf({
      category: 'value',
      title: capitalize(type) + ' Value',
    });
  }
}
