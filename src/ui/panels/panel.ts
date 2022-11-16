import { element } from '../../utils/document';
import { cssSelectors } from '../cssSelectors';
import { PanelTabInfo, PanelTabInfoWithActive } from './panel.types';
import { findById, isUndefined } from '../../utils/data';
import { Input } from '../components/input';

export const Panel = (
  direction: 'left' | 'right',
  children: HTMLElement[] = [],
  ...classNames: string[]
) => {
  const panel = element<HTMLElement>(
    'aside',
    cssSelectors.ui.panels.panel,
    cssSelectors.ui.panels[direction],
    ...classNames,
  );
  panel.append(...children);
  return panel;
};

export const Header = (
  children: HTMLElement[] = [],
  ...classNames: string[]
) => {
  const header = element<HTMLElement>(
    'header',
    cssSelectors.ui.panels.header,
    ...classNames,
  );
  header.append(...children);
  return header;
};

export const TabSwitcher = (
  tabs: PanelTabInfo<HTMLElement>[],
  activeId?: number,
) => {
  const container = element('div', cssSelectors.ui.panels.tabs.container);
  if (tabs.length === 0) return container;
  let activeTabId = activeId ?? tabs[0].id;
  let activeTab = findById(tabs, activeTabId);
  if (isUndefined(activeTab)) {
    activeTabId = tabs[0].id;
    activeTab = tabs[0] as PanelTabInfo<HTMLElement>;
  }

  const switchActiveTab = (tabId: number) => {
    if (tabs.some(({ id }) => id === tabId)) {
      activeTabId = tabId;
      activeTab = findById(tabs, activeTabId) as PanelTabInfo<HTMLElement>;
      build();
    }
  };

  const build = () => {
    container.replaceChildren(
      ...[
        TabBar(
          tabs.map((tab) => ({ ...tab, active: tab.id === activeTabId })),
          switchActiveTab,
        ),
        ...(activeTab as PanelTabInfo<HTMLElement>).content,
      ],
    );
  };
  build();
  return container;
};

export const TabBar = (
  tabs: PanelTabInfoWithActive<HTMLElement>[],
  selectTab: (id: number) => void,
) => {
  const nav = element<HTMLElement>(
    'nav',
    cssSelectors.ui.panels.tabs.bar,
    cssSelectors.ui.panels.header,
  );
  // create buttons and update them
  const buttons = tabs.map((tab) =>
    TabButton(tab, () => selectTab(tab.id), tab.active),
  );
  nav.append(...buttons);
  return nav;
};

export const TabButton = (
  tab: PanelTabInfo<HTMLElement>,
  onClick: () => void,
  active = false,
) => {
  const button = element<HTMLButtonElement>(
    'button',
    cssSelectors.ui.panels.tabs.button,
  );
  button.classList.toggle(cssSelectors.ui.panels.tabs.buttonActive, active);
  button.textContent = tab.name;
  button.addEventListener('click', onClick);
  return button;
};

Panel.Header = Header;
Panel.TabSwitcher = TabSwitcher;
Panel.TabBar = TabBar;
Panel.TabButton = TabButton;

export const SearchBar = (
  onChange: (v: string) => void,
  placeholder = 'Find Stuff',
) => {
  const input = Input('string', onChange, '', placeholder);
  input.classList.add(cssSelectors.ui.panels.search.input);
  const button = element<HTMLButtonElement>(
    'button',
    cssSelectors.ui.panels.search.button,
  );
  button.addEventListener('click', () => onChange(input.value));
  button.textContent = 'Search';
  const container = element<HTMLDivElement>(
    'div',
    cssSelectors.ui.panels.search.root,
  );
  container.append(input, button);
  return container;
};
