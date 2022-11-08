import { DefinedIOType, IOTypeName, NodeCategory } from '../node/node.types';
import { normalizeCssClass } from '../utils/css';

export const ioRow = {
  editable: normalizeCssClass('node io editable'),
  connected: normalizeCssClass('node io connected'),
  input: normalizeCssClass('node io input'),
  output: normalizeCssClass('node io output'),
  ioRow: normalizeCssClass('node io row'),
  indicator: normalizeCssClass('node io indicator'),
  name: normalizeCssClass('node io name'),
  container: normalizeCssClass('node io row container'),
  id: (nodeId: number, ioId: number, isOutput: boolean) =>
    normalizeCssClass(
      `node ${nodeId} ${isOutput ? 'output' : 'input'} ${ioId}`,
    ),
  edit: {
    textInput: normalizeCssClass('node io text input'),
    toggle: normalizeCssClass('node io toggle'),
  },
  multi: normalizeCssClass('node io multi'),
} as const;

export const nodeCard = {
  root: normalizeCssClass('node card root'),
  header: normalizeCssClass('node card header'),
  title: normalizeCssClass('node card title'),
  highlight: normalizeCssClass('node card highlight'),
  ioContainer: normalizeCssClass('node io container'),
  io: normalizeCssClass('node io'),
  inputs: normalizeCssClass('node inputs'),
  outputs: normalizeCssClass('node outputs'),
  helpButton: normalizeCssClass('node help button'),
  id: (nodeId: number) => normalizeCssClass(`node ${nodeId}`),
  type: (t: DefinedIOType) => normalizeCssClass(`node type ${t}`),
  category: (c: NodeCategory) => normalizeCssClass(`node category ${c}`),
} as const;

export const renderer = {
  root: normalizeCssClass('node renderer root'),
  connections: {
    root: normalizeCssClass('node connections root'),
    paths: normalizeCssClass('node connection paths'),
    pending: normalizeCssClass('node connection pending'),
    gradientId: (inputColor: IOTypeName, outputColor: IOTypeName) =>
      normalizeCssClass(`gradient ${inputColor} ${outputColor}`),
  },
} as const;

export const ui = {
  root: normalizeCssClass('ui root'),
  panels: {
    panel: normalizeCssClass('ui panel'),
    left: normalizeCssClass('ui panel left'),
    right: normalizeCssClass('ui panel right'),
    body: normalizeCssClass('ui panel body'),
    header: normalizeCssClass('ui panel header'),
    nodes: {
      root: normalizeCssClass('ui panel nodes'),
      list: normalizeCssClass('ui panel nodes list'),
      nodeCategoryCard: {
        root: normalizeCssClass('ui panel nodes category'),
        header: normalizeCssClass('ui panel nodes category header'),
        list: normalizeCssClass('ui panel nodes category list'),
        title: normalizeCssClass('ui panel nodes category title'),
      },
      nodeCreateCard: {
        root: normalizeCssClass('ui node create card root'),
        button: normalizeCssClass('ui node create card button'),
      },
    },
  },
  panelCard: {
    root: normalizeCssClass('ui panel card'),
    header: normalizeCssClass('ui panel card header'),
  },
  icons: {
    icon: normalizeCssClass('ui icon'),
    help: normalizeCssClass('ui icon help'),
    number: normalizeCssClass('ui icon number'),
  },
} as const;

export const cssSelectors = {
  ioRow,
  nodeCard,
  ui,
  renderer,
} as const;
