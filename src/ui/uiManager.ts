import { TabName, UIManagerOptions } from './uiManager.types';
import { createUiRoot } from './uiRoot';
import { createNodePanel } from './panels/nodes';
import { Runtime } from '../runtime/runtime';

export class UIManager {
  root: HTMLElement;
  target: UIManagerOptions['target'];
  activeTabName: TabName = TabName.inspect;
  nodesPanel: HTMLElement;
  runtime: Runtime;

  constructor(options: UIManagerOptions) {
    this.target = options.target;
    this.runtime = options.runtime;
    this.root = createUiRoot();
    this.nodesPanel = createNodePanel(
      this.runtime.createNode.bind(this.runtime),
    );

    this.attachUI();
  }

  attachUI() {
    this.target.appendChild(this.root);
    this.root.appendChild(this.nodesPanel);
  }
}
