import { DefinedIOType, NodeCategory } from '../../node/node.types';

export const ioRow = {
  editable: 'node__io__editable',
  connected: 'node__io__connected',
  input: 'node__io__input',
  output: 'node__io__output',
  ioRow: 'node__io__row',
  indicator: 'node__io__indicator',
  name: 'node__io__name',
  container: 'node__io__row__container',
  id: (nodeId: number, ioId: number, isOutput: boolean) =>
    `node__${nodeId}__${isOutput ? 'output' : 'input'}__${ioId}`,
  edit: {
    textInput: 'node__io__text__input',
    toggle: 'node__io__toggle',
  },
} as const;

export const nodeCard = {
  root: 'node__card__root',
  header: 'node__card__header',
  title: 'node__card__title',
  highlight: 'node__card__highlight',
  ioContainer: 'node__io__container',
  io: 'node__io',
  inputs: 'node__inputs',
  outputs: 'node__outputs',
  id: (nodeId: number) => `node__${nodeId}`,
  type: (t: DefinedIOType) => `node__type__${t}`,
  category: (c: NodeCategory) => `node__category__${c}`,
} as const;

export const cssSelectors = {
  ioRow,
  nodeCard,
} as const;
