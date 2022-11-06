import { Node } from './node';

export const IOArrayTypeNames = [
  'string[]',
  'number[]',
  'object[]',
  'boolean[]',
  'any[]',
  'property[]',
] as const;

export const IOTypeNames = [
  'string',
  'number',
  'object',
  'boolean',
  'any',
  'property',
  ...IOArrayTypeNames,
] as const;

export const NodeCategories = [
  'logic',
  'value',
  'math',
  'booleanMath',
  'base',
] as const;

export const NodeTypeNames = [...IOTypeNames, 'base'] as const;

export type NodeTypeName = typeof NodeTypeNames[number];

export type NodeCategory = typeof NodeCategories[number];

export type IOArrayTypeName = typeof IOArrayTypeNames[number];

export type IOTypeName = typeof IOTypeNames[number];

export interface PropertyIOType<
  T extends DefinedIOType = DefinedIOType,
  TN extends IOTypeName = IOTypeName,
> {
  kind: 'property';
  value: T;
  name: string;
  type: TN;
}

export type IOArrayType =
  | number[]
  | string[]
  | Record<string, IOType>[]
  | boolean[];

export type IOType =
  | string
  | number
  | Record<string, unknown>
  | boolean
  | IOArrayType
  | PropertyIOType
  | undefined;

export type DefinedIOType = Exclude<IOType, undefined>;

export interface NodeIO<
  T extends DefinedIOType = DefinedIOType,
  TN extends IOTypeName = IOTypeName,
> {
  name: string;
  type: TN;
  value: T;
  connection?: {
    connected: boolean;
    node: Node<T, TN>;
    ioId: number;
  };
  kind: 'input' | 'output';
  editable: boolean;
  multi: boolean;
  node: Node<T, TN>;
}

export interface NodeOperationArgument<
  T extends IOType = IOType,
  TN extends IOTypeName = IOTypeName,
> {
  value: T;
  type: TN;
  name: string;
}

export interface NodeIOWithId<
  T extends DefinedIOType = DefinedIOType,
  TN extends IOTypeName = IOTypeName,
> extends NodeIO<T, TN> {
  id: number;
}

export type NodeIODefinition<
  T extends IOType = IOType,
  TN extends IOTypeName = IOTypeName,
> = {
  name: string;
  type: TN;
  value?: T;
  editable?: boolean;
};

export type NodeOperation<
  T extends IOType,
  TN extends IOTypeName,
  OT extends DefinedIOType = DefinedIOType,
  OTN extends IOTypeName = IOTypeName,
> = (
  inputs: NodeOperationArgument<T, TN>[],
) =>
  | NodeOperationArgument<OT, OTN>
  | NodeOperationArgument<OT, OTN>[]
  | Promise<NodeOperationArgument<OT, OTN>[]>
  | Promise<NodeOperationArgument<OT, OTN>>;

export interface NodeWithId<
  OperationInputType extends IOType,
  OperationInputTypeName extends IOTypeName,
> extends Node<OperationInputType, OperationInputTypeName> {
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
