import { TabName, UIManagerOptions } from './uiManager.types';
import { createUiRoot } from './uiRoot';
import { createNodePanel } from './panels/nodes';
import { Runtime } from '../runtime/runtime';
import { createRightPanel } from './panels/rightPanel';
import { RuntimeOutput } from '../runtime/runtime.types';
import { OutputsList } from './panels/tabs/outputs';

export class UIManager {
  root: HTMLElement;
  target: UIManagerOptions['target'];
  activeTabName: TabName = TabName.inspect;
  nodesPanel: HTMLElement;
  rightPanel: ReturnType<typeof createRightPanel>;
  runtime: Runtime;

  constructor(options: UIManagerOptions) {
    this.target = options.target;
    this.runtime = options.runtime;
    this.root = createUiRoot();
    this.nodesPanel = createNodePanel(
      this.runtime.createNode.bind(this.runtime),
    );
    this.rightPanel = createRightPanel({
      outputs: this.runtime.outputs,
    });
    this.attachUI();
  }

  public update(data: { outputs?: RuntimeOutput[] }) {
    if (data.outputs) {
      console.log(data.outputs);
      OutputsList.refresh(this.rightPanel.tabs.outputTab.list, data.outputs);
    }
  }

  private attachUI() {
    this.target.appendChild(this.root);
    this.root.appendChild(this.nodesPanel);
    this.root.appendChild(this.rightPanel.panel);
  }
}
