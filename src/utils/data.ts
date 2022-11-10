import {
  IOArrayTypeName,
  IOArrayTypeNames,
  IOTypeName,
  NodeIODefinition,
} from '../node/node.types';

export const findById = <T extends { id: number | string }>(
  array: T[],
  query: number | string,
): T | undefined => array.find(({ id }) => id === query);

export const isMultiIO = (io: NodeIODefinition) => {
  return (
    Array.isArray(io.value) ||
    IOArrayTypeNames.includes(io.type as IOArrayTypeName)
  );
};

export const isDefined = <T extends unknown | undefined>(
  item: T,
): item is Exclude<T, undefined> => item !== undefined;

export const isUndefined = <T>(item: T | undefined): item is undefined =>
  item === undefined;

export const getSingleType = (
  t: IOTypeName,
): Exclude<IOTypeName, IOArrayTypeName> =>
  t.split('[]')[0] as Exclude<IOTypeName, IOArrayTypeName>;

export const isArrayType = (t: IOTypeName): t is IOArrayTypeName =>
  !!t.split('[]')[1];

export const isAnyType = (t: IOTypeName): t is 'any' | 'any[]' =>
  t === 'any' || t === 'any[]';

export const absoluteDiff = (a: number, b: number) => Math.abs(a - b);
