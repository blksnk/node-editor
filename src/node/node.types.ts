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
  'runtime',
] as const;

export type IOTypeMap<TN extends IOTypeName> = TN extends 'string'
  ? string
  : TN extends 'number'
  ? number
  : TN extends 'object'
  ? Record<string, IOType>[]
  : TN extends 'boolean'
  ? boolean
  : TN extends 'property'
  ? PropertyIOType
  : TN extends 'string[]'
  ? string[]
  : TN extends 'number[]'
  ? number[]
  : TN extends 'object[]'
  ? Record<string, IOType>[]
  : TN extends 'boolean[]'
  ? boolean[]
  : TN extends 'property[]'
  ? PropertyIOType[]
  : TN extends 'any[]'
  ? unknown[]
  : unknown;

export const NodeTypeNames = [...IOTypeNames, 'base'] as const;

export type NodeTypeName = typeof NodeTypeNames[number];

export type NodeCategory = typeof NodeCategories[number];

export type IOArrayTypeName = typeof IOArrayTypeNames[number];

export type IOTypeName = typeof IOTypeNames[number];

export type DefinedIOTypeName = Exclude<IOTypeName, 'any' | 'any[]'>;

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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  | Record<string, IOType>[]
  | boolean[];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type IOType = Exclude<
  | string
  | number
  | Record<string, unknown>
  | boolean
  | IOArrayType
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  | PropertyIOType
  | unknown,
  undefined
>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type DefinedIOType = Exclude<IOType, undefined>;

export interface NodeIO<TN extends IOTypeName = IOTypeName> {
  name: string;
  type: TN;
  value: IOTypeMap<TN>;
  connection: {
    connected: boolean;
    connections: {
      node: NodeWithId;
      ioId: number;
    }[];
  };
  kind: 'input' | 'output';
  editable: boolean;
  multi: boolean;
  node: Node;
}

export interface NodeOperationArgument<
  T extends IOType = IOType,
  TN extends IOTypeName = IOTypeName,
> {
  value: T;
  type: TN;
  name: string;
}

export interface NodeIOWithId<TN extends IOTypeName = IOTypeName>
  extends NodeIO<TN> {
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

export type NodeIoToNodeOperationArgument<TN extends IOTypeName[]> = {
  [P in keyof TN]: NodeOperationArgument<IOTypeMap<TN[P]>, TN[P]>;
};

export type IOTypeNamesToNodeIOWithIds<TN extends IOTypeName[]> = {
  [P in keyof TN]: NodeIOWithId<TN[P]>;
};

export type NodeOperation<
  TN extends IOTypeName[] = IOTypeName[],
  OTN extends IOTypeName[] = IOTypeName[],
> = (
  inputs: NodeIoToNodeOperationArgument<TN>,
) =>
  | NodeIoToNodeOperationArgument<OTN>
  | Promise<NodeIoToNodeOperationArgument<OTN>>;

export type WithDefinedId<T extends { id?: number }> = T & { id: number };

export interface NodeWithId<
  ITN extends IOTypeName[] = IOTypeName[],
  OTN extends IOTypeName[] = IOTypeName[],
> extends Node<ITN, OTN> {
  id: number;
}

export type NodeConnectionIds = {
  id: number;
  ioId: number;
}[];

export interface NodeConnectionInfo {
  ioId: number;
  connected: boolean;
  connections: NodeConnectionIds | undefined;
  type: IOTypeName;
  nodeId: number;
}
