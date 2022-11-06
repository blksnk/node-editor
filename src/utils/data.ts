import {
  IOArrayTypeName,
  IOArrayTypeNames,
  NodeIODefinition,
} from "../node/node.types";

export const findById = <T extends { id: number | string }>(array: T[], query: number | string): T | undefined =>
  array.find(({ id }) => id === query);

export const isMultiIO = (io: NodeIODefinition) => {
  return Array.isArray(io.value) || IOArrayTypeNames.includes(io.type as IOArrayTypeName);
};