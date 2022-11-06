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

export const getSingleType = (
  t: IOTypeName,
): Exclude<IOTypeName, IOArrayTypeName> =>
  t.split('[]')[0] as Exclude<IOTypeName, IOArrayTypeName>;
