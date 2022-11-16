import { element } from '../../utils/document';
import { cssSelectors } from '../cssSelectors';
import {
  NodeCategoryDefinition,
  NodeCategoryTitle,
  NodeRepository,
} from '../uiManager.types';
import {
  AnyNodeKey,
  BooleanNodeKeys,
  LogicNodeKeys,
  NumberNodeKeys,
  ObjectNodeKeys,
  RuntimeNodeKeys,
  StringNodeKeys,
} from '../../node/nodeIndex';
import { Icon, IconNames } from '../components/icons';
import { NodeCategory } from '../../node/node.types';
import { Header, PanelCard } from './panelCard';
import { NodeTitles } from '../../node/nodeTitles';
import { Vec2 } from '../../renderer/renderer.types';
import { eventPos } from '../../utils/vectors';
import { absoluteDiff } from '../../utils/data';
import { Panel, SearchBar, TabSwitcher } from './panel';

export const createNodePanel = (
  dispatchCreateNode: (kind: AnyNodeKey) => void,
  filters: NodeCategoryTitle[] = [],
) => {
  let textSearch = '';
  const onSearch = (v: string) => {
    textSearch = v;
    console.log(textSearch);
  };
  const tab = {
    name: 'Available Nodes',
    content: [
      SearchBar(onSearch, 'Find nodes...'),
      createAllNodeCategoryCards(dispatchCreateNode, filters),
    ],
    id: 0,
  };
  return Panel(
    'left',
    [TabSwitcher([tab], 0)],
    cssSelectors.ui.panels.nodes.root,
  );
};

export const nodesRepository: NodeRepository = {
  Numbers: {
    title: 'Numbers',
    nodes: NumberNodeKeys,
  },
  Booleans: {
    title: 'Booleans',
    nodes: BooleanNodeKeys,
  },
  Strings: {
    title: 'Strings',
    nodes: StringNodeKeys,
  },
  Objects: {
    title: 'Objects',
    nodes: ObjectNodeKeys,
  },
  Arrays: {
    title: 'Arrays',
    nodes: [],
  },
  Logic: {
    title: 'Logic',
    nodes: LogicNodeKeys,
  },
  Runtime: {
    title: 'Runtime',
    nodes: RuntimeNodeKeys,
  },
} as const;

export const attachCreateNodeButtonEvent = (
  button: HTMLButtonElement,
  dispatchCreateNode: () => void,
) => {
  // only actually create node if pointer has moved a bit from button
  let downPos: Vec2 = { x: 0, y: 0 };
  let creationAllowed = false;
  button.addEventListener('pointerdown', (e: PointerEvent) => {
    creationAllowed = true;
    downPos = eventPos(e);
  });

  button.addEventListener('pointermove', (e: PointerEvent) => {
    const currentPos = eventPos(e);
    const diff = absoluteDiff(downPos.x, currentPos.x);
    if (diff > 20 && creationAllowed) {
      creationAllowed = false;
      dispatchCreateNode();
    }
  });
};

export const createNodeCardButton = (
  nodeKind: AnyNodeKey,
  dispatchCreateNode: () => void,
) => {
  const title = NodeTitles[nodeKind];
  const type = nodeKind.split('::')[0];
  const category = nodeKind.split('::')[1] as NodeCategory;
  const li = element<HTMLLIElement>(
    'li',
    cssSelectors.ui.panels.nodes.nodeCreateCard.root,
    cssSelectors.nodeCard.type(type),
    cssSelectors.nodeCard.category(category),
  );
  const button = element<HTMLButtonElement>(
    'button',
    cssSelectors.ui.panels.nodes.nodeCreateCard.button,
  );
  const nodeTitle = element<HTMLHeadingElement>('h3');

  nodeTitle.innerText = title;
  button.append(nodeTitle, Icon('help'));
  attachCreateNodeButtonEvent(button, dispatchCreateNode);
  li.append(button);
  return li;
};

export const createNodeCategoryCard = (
  category: NodeCategoryDefinition<NodeCategoryTitle>,
  dispatchCreateNode: (kind: AnyNodeKey) => void,
) => {
  const { title, nodes } = category;
  const nodeList = element<HTMLUListElement>(
    'ul',
    cssSelectors.ui.panelCard.list,
  );
  // format header with category header and icon.
  // TODO: category icon
  const icon = IconNames.includes(title) ? Icon(title) : Icon('help');
  const header = Header(
    [icon, PanelCard.Title(title)],
    cssSelectors.ui.panels.nodes.nodeCategoryCard.header,
  );
  // create node cards from node kinds in category
  nodeList.append(
    ...nodes.map((nodeKind) =>
      createNodeCardButton(nodeKind, () => dispatchCreateNode(nodeKind)),
    ),
  );
  // finally combine elements into node category card
  return PanelCard(
    [header, nodeList],
    cssSelectors.ui.panels.nodes.nodeCategoryCard.root,
  );
};

const getFilteredNodeCategories = (filters: NodeCategoryTitle[] = []) =>
  Object.values(nodesRepository).filter(({ title }) =>
    filters.length === 0 ? true : filters.includes(title),
  );

export const createAllNodeCategoryCards = (
  dispatchCreateNode: (kind: AnyNodeKey) => void,
  filters: NodeCategoryTitle[] = [],
) => {
  const list = element<HTMLDivElement>(
    'div',
    cssSelectors.ui.panels.nodes.list,
    cssSelectors.ui.panels.body,
  );
  // only display filtered categories
  const categories = getFilteredNodeCategories(filters);
  // add category cards to list children;
  list.append(
    ...categories.map((c) => createNodeCategoryCard(c, dispatchCreateNode)),
  );
  return list;
};
