import { Runtime } from '../runtime/runtime';
import { AnyNodeKey } from '../node/nodeIndex';

export interface UIManagerOptions {
  target: HTMLElement | HTMLBodyElement;
  runtime: Runtime;
}

export enum TabName {
  learn = 'Learn',
  inspect = 'Inspect',
  outputs = 'Outputs',
}

export const NodeCategoryTitles = [
  'Numbers',
  'Strings',
  'Booleans',
  'Objects',
  'Arrays',
  'Logic',
  'Runtime',
] as const;

export type NodeCategoryTitle = Readonly<typeof NodeCategoryTitles[number]>;

export interface NodeCategoryDefinition<T extends NodeCategoryTitle> {
  readonly title: T;
  readonly nodes: Readonly<AnyNodeKey[]>;
}

export type NodeRepository = {
  readonly [P in NodeCategoryTitle]: Readonly<NodeCategoryDefinition<P>>;
};
