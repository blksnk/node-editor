import { RuntimeOutput } from '../../../runtime/runtime.types';
import { PanelCard } from '../panelCard';
import { cssSelectors } from '../../cssSelectors';
import { DIV, element } from '../../../utils/document';
import { IOTypeName } from '../../../node/node.types';
import { OutputRowsContainer } from '../../components/outputs/blocks';
import {
  BooleanOutputRows,
  NumberOutputRows,
  ObjectOutputRows,
  StringOutputRows,
} from '../../components/outputs/string';

export const OutputsTab = (outputs: RuntimeOutput[]) => {
  const list = OutputsList(outputs);
  const tab = {
    name: 'Outputs',
    content: [list],
    id: 1,
  };
  return { tab, list };
};

export const OutputsList = (outputs: RuntimeOutput[]) => {
  const list = element<HTMLDivElement>(
    'div',
    cssSelectors.ui.panels.nodes.list,
    cssSelectors.ui.panels.body,
  );
  list.append(...outputs.map((o) => OutputCard(o)));
  return list;
};

OutputsList.refresh = (list: HTMLDivElement, outputs: RuntimeOutput[]) => {
  list.replaceChildren(...outputs.map((o) => OutputCard(o)));
};

export const OutputCardIndicator = (type: IOTypeName) =>
  DIV(
    [],
    cssSelectors.ioRow.indicator,
    cssSelectors.ioRow.connected,
    cssSelectors.ui.panelCard.indicator,
    cssSelectors.nodeCard.type(type),
  );

export const OutputCard = (output: RuntimeOutput) => {
  const card = PanelCard([
    PanelCard.Header([
      OutputCardIndicator(output.type),
      PanelCard.Title(output.name),
    ]),
    OutputCardValues(output),
  ]);

  return card;
};

export const OutputCardValues = (output: RuntimeOutput) => {
  return OutputRowsContainer(
    (() => {
      switch (output.type) {
      case 'string':
        return StringOutputRows(output);
      case 'number':
        return NumberOutputRows(output);
      case 'boolean':
        return BooleanOutputRows(output);
      case 'object':
        return ObjectOutputRows(output);
      default:
        return [];
      }
    })(),
  );
};
