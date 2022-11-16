import { RuntimeOutput } from '../../runtime/runtime.types';
import { Panel, TabSwitcher } from './panel';
import { OutputsTab } from './tabs/outputs';
import { InspectTab } from './tabs/inspect';
import { LearnTab } from './tabs/learn';

export const createRightPanel = (data: { outputs: RuntimeOutput[] }) => {
  const inspectTab = InspectTab();
  const outputTab = OutputsTab(data.outputs);
  const learnTab = LearnTab();
  const panel = Panel('right', [
    TabSwitcher([inspectTab, outputTab.tab, learnTab], 1),
  ]);
  return {
    panel,
    tabs: {
      inspectTab,
      outputTab,
      learnTab,
    },
  };
};
