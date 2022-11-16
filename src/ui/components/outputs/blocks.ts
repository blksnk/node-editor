import { IOType, IOTypeName } from '../../../node/node.types';
import { HEADING, LI, SPAN, UL } from '../../../utils/document';
import { cssSelectors } from '../../cssSelectors';
import { capitalize } from '../../../utils/strings';

export const OutputRow = ({
  name,
  value,
  type,
  keepCase = false,
  small = false,
}: {
  name: string;
  value: IOType;
  type: IOTypeName;
  keepCase?: boolean;
  small?: boolean;
}) => {
  const row = LI(
    [OutputRowName(name, keepCase), OutputRowValue(value, type)],
    cssSelectors.ui.output.row,
  );
  row.classList.toggle(cssSelectors.ui.output.rowSmall, small);
  console.log(value, type);
  return row;
};

export const OutputRowName = (n: string, keepCase: boolean) => {
  const name = HEADING(5, [], cssSelectors.ui.output.rowName);
  name.textContent = (keepCase ? n : capitalize(n)) + ':';
  return name;
};

export const OutputRowsContainer = (children: HTMLLIElement[]) => {
  return UL(
    children,
    cssSelectors.ui.output.rowContainer,
    cssSelectors.ui.panelCard.list,
  );
};

export const OutputRowTextValue = (
  value: string | boolean | number,
  type: IOTypeName,
) => {
  const text = SPAN(
    [],
    cssSelectors.nodeCard.type(type),
    cssSelectors.ui.output.rowValue,
  );
  text.innerText =
    type === 'string' && typeof value === 'string'
      ? `"${value}"`
      : value.toString();
  return text;
};

export const OutputRowValue = (value: IOType, type: IOTypeName) => {
  switch (type) {
  case 'string':
  case 'number':
  case 'boolean':
    return OutputRowTextValue(value as string | boolean | number, type);

  default: {
    const undef = SPAN([]);
    undef.textContent = JSON.stringify(value);
    return undef;
  }
  }
};
