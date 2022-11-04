import { Node } from "./node";

// export enum IOTypeName {
//   string = 'string',
//   number = 'number',
//   object = 'object',
//   array = 'array',
//   boolean = 'boolean',
// }

export const IOTypeNames = [
  'string',
  'number',
  'object',
  'array',
  'boolean',
  'any',
  'property',
] as const;

export const NodeCategories = [
  'logic',
  'value',
  'math',
  'booleanMath',
  'base',
] as const;

export const NodeTypeNames = [
  ...IOTypeNames,
  'base',
] as const;

export type NodeTypeName = typeof NodeTypeNames[number];

export type NodeCategory = typeof NodeCategories[number];

export type IOTypeName = typeof IOTypeNames[number];

export type IOArrayType = number[] | string[] | object[] | boolean[];

export type IOType = string | number | object | boolean | IOArrayType | undefined;

export type DefinedIOType = Exclude<IOType, undefined>;

export interface NodeIO<T extends DefinedIOType = DefinedIOType, TN extends IOTypeName = IOTypeName> {
  name: string;
  type: TN;
  value: T;
  connection?: {
    connected: boolean;
    node: Node<T, TN>,
    ioId: number;
  }
  kind: 'input' | 'output';
  node: Node<T, TN>;
}

export interface NodeOperationArgument<T extends IOType = IOType, TN extends IOTypeName = IOTypeName> {
  value: T;
  type: TN;
  name: string;
}

export interface NodeIOWithId<T extends DefinedIOType = DefinedIOType, TN extends IOTypeName = IOTypeName> extends NodeIO<T, TN> {
  id: number;
}

export type NodeIODefinition<T extends IOType = IOType, TN extends IOTypeName = IOTypeName> = {
  name: string;
  type: TN;
  value?: T
}

export type NodeOperation <T extends IOType, TN extends IOTypeName, OT extends DefinedIOType = DefinedIOType, OTN extends IOTypeName = IOTypeName> = (
  inputs: NodeOperationArgument<T, TN>[]
) => NodeOperationArgument<OT, OTN> | NodeOperationArgument<OT, OTN>[] | Promise<NodeOperationArgument<OT, OTN>[]> | Promise<NodeOperationArgument<OT, OTN>>;

export interface NodeWithId<OperationInputType extends IOType, OperationInputTypeName extends IOTypeName> extends Node<OperationInputType, OperationInputTypeName> {
  id: number;
}

export interface NodeConnectionIds {
  id: number;
  ioId: number;
}

export interface NodeConnectionInfo {
  ioId: number;
  connected: boolean;
  connection: NodeConnectionIds | undefined;
  type: IOTypeName;
  nodeId: number;
}