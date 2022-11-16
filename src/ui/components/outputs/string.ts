import { RuntimeOutput } from '../../../runtime/runtime.types';
import { NumberRow, ObjectRow, StringRow, ValueRow } from './globals';
import { ObjectIOType } from '../../../node/node.types';

export const StringOutputRows = (output: RuntimeOutput) => [
  StringRow({
    name: 'value',
    value: output.value as string,
  }),
  NumberRow({
    name: 'length',
    value: (output.value as string).length,
  }),
];

export const NumberOutputRows = (output: RuntimeOutput) => [ValueRow(output)];

export const BooleanOutputRows = (output: RuntimeOutput) => [ValueRow(output)];

export const ObjectOutputRows = (output: RuntimeOutput) =>
  ObjectRow({ value: output.value as ObjectIOType });
