import { element } from '../utils/document';
import { cssSelectors } from './cssSelectors';

export const createUiRoot = () => {
  const root = element<HTMLElement>('main');
  root.classList.add(cssSelectors.ui.root);
  return root;
};
