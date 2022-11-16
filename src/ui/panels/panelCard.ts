import { element } from '../../utils/document';
import { cssSelectors } from '../cssSelectors';

export const PanelCard = (children: Node[] = [], ...classNames: string[]) => {
  const card = element<HTMLElement>(
    'article',
    cssSelectors.ui.panelCard.root,
    ...classNames,
  );
  card.append(...children);
  return card;
};

export const Header = (children: Node[] = [], ...classNames: string[]) => {
  const header = element<HTMLElement>(
    'header',
    cssSelectors.ui.panelCard.header,
    ...classNames,
  );
  header.append(...children);
  return header;
};

export const Title = (text: string, ...classNames: string[]) => {
  const title = element<HTMLHeadingElement>(
    'h2',
    cssSelectors.ui.panelCard.title,
    ...classNames,
  );
  title.innerText = text;
  return title;
};

PanelCard.Header = Header;
PanelCard.Title = Title;
