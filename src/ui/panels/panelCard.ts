import { element } from '../../utils/document';
import { cssSelectors } from '../cssSelectors';

export const createPanelCardHeader = (
  children: Node[] = [],
  ...classNames: string[]
) => {
  const header = element<HTMLElement>(
    'header',
    cssSelectors.ui.panelCard.header,
    ...classNames,
  );
  header.append(...children);
  return header;
};

export const createPanelCard = (
  children: Node[] = [],
  ...classNames: string[]
) => {
  const card = element<HTMLElement>(
    'article',
    cssSelectors.ui.panelCard.root,
    ...classNames,
  );
  card.append(...children);
  return card;
};
