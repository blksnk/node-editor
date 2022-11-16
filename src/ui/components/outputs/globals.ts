import { RuntimeOutput } from '../../../runtime/runtime.types';
import { OutputRow } from './blocks';
import { ObjectIOType } from '../../../node/node.types';

export const ValueRow = (output: RuntimeOutput) =>
  OutputRow({
    name: 'value',
    value: output.value,
    type: output.type,
  });

export const StringRow = ({ name, value }: { name: string; value: string }) =>
  OutputRow({
    name,
    value,
    type: 'string',
  });

export const NumberRow = ({ name, value }: { name: string; value: number }) =>
  OutputRow({
    name,
    value,
    type: 'number',
  });

export const ObjectRow = ({ value }: { value: ObjectIOType }) => {
  const { __propTypes: propTypes } = value;
  const onlyValues = { ...value };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete onlyValues['__propTypes'];

  const rows = Object.entries(onlyValues).map(([k, v]) => {
    const valueType = propTypes[k];
    return OutputRow({
      name: k,
      value: v,
      type: valueType,
      keepCase: true,
    });
  });
  console.log(rows);
  return rows;
  // return [
  //   OutputRow({
  //     name: 'value',
  //     value: JSON.stringify(value),
  //     type: 'string',
  //   }),
  // ];
};
