import {
  DefinedIOType,
  IOTypeName,
  NodeConnectionIds,
  NodeConnectionInfo,
  NodeIOWithId,
  NodeWithId,
} from '../../node/node.types';
import { element } from '../../utils/document';
import { Input } from './input';
import { Toggle } from './toggle';
import { cssSelectors } from './cssSelectors';
import { cssClass } from '../../utils/css';

export const createCardIoRow = (
  list: HTMLUListElement,
  io: NodeIOWithId,
  node: NodeWithId,
  setIoValue: (value: DefinedIOType) => void,
) => {
  const isOutput = io.kind === 'output';

  const li = element<HTMLLIElement>('li');
  li.classList.add('node__io__row');
  li.id = cssSelectors.ioRow.id(node.id, io.id, isOutput);
  // inject io data
  storeIoInformation(li, io);

  // style based on type and connection state
  li.classList.toggle(cssSelectors.ioRow.output, isOutput);
  li.classList.toggle(cssSelectors.ioRow.input, !isOutput);
  li.classList.toggle(cssSelectors.ioRow.editable, io.editable);
  li.classList.toggle(
    cssSelectors.ioRow.connected,
    io.connection?.connected ?? false,
  );
  li.classList.add(io.type.split('[]')[0]);
  const container = createIORowContainer(io, setIoValue);
  const indicator = createIoRowIndicator(io);

  li.append(...(isOutput ? [container, indicator] : [indicator, container]));
  list.appendChild(li);
  return li;
};

const createIoRowIndicator = (io: NodeIOWithId) => {
  const indicator = element<HTMLDivElement>('div');
  indicator.classList.add(cssSelectors.ioRow.indicator);
  if (io.multi) {
    indicator.classList.add(cssSelectors.ioRow.multi);
  }
  indicator.classList.toggle(
    cssSelectors.ioRow.connected,
    Boolean(io.connection?.connected),
  );
  return indicator;
};

const createIoRowName = (name: string) => {
  const ioName = element<HTMLSpanElement>('span');
  ioName.classList.add(cssSelectors.ioRow.name);
  ioName.textContent = name;
  return ioName;
};

const createIORowContainer = (
  io: NodeIOWithId,
  setIoValue: (value: DefinedIOType) => void,
) => {
  const container = element<HTMLDivElement>('div');
  const name = createIoRowName(io.name);
  container.appendChild(name);

  // display value as input or toggle if editable
  const editComponent = createIORowEditComponentIfNeeded(io, setIoValue);
  editComponent && container.appendChild(editComponent);

  container.classList.add(cssSelectors.ioRow.container);
  return container;
};

const createIORowEditComponentIfNeeded = (
  io: NodeIOWithId,
  setIoValue: (value: DefinedIOType) => void,
): HTMLInputElement | HTMLDivElement | undefined => {
  if (!io.editable || (io.connection?.connected && io.kind === 'input'))
    return undefined;
  // TODO: add case for boolean

  return io.type === 'number' || io.type === 'string'
    ? createIORowInput(io as NodeIOWithId<'string' | 'number'>, setIoValue)
    : io.type === 'boolean'
      ? createIORowToggle(io as NodeIOWithId<'boolean'>, setIoValue)
      : undefined;
};

const createIORowInput = (
  io: NodeIOWithId<'string' | 'number'>,
  setIoValue: (value: string | number) => void,
) => {
  // use generic input component
  const input = Input(io.type, setIoValue, io.value);
  // style input
  input.classList.add(cssSelectors.ioRow.edit.textInput);
  input.placeholder = io.type === 'number' ? '1.0' : 'Hello World';
  return input;
};

const createIORowToggle = (
  io: NodeIOWithId<'boolean'>,
  setIoValue: (value: boolean) => void,
) => {
  const toggle = Toggle(io.value, setIoValue);
  toggle.classList.add(cssSelectors.ioRow.edit.toggle);
  return toggle;
};

export const storeIoInformation = (li: HTMLLIElement, io: NodeIOWithId) => {
  li.dataset.id = String(io.id);
  li.dataset.nodeId = String(io.node.id);
  li.dataset.type = io.type;
  li.dataset.connected = String(io.connection?.connected ?? false);
  li.dataset.connections = io.connection.connected
    ? JSON.stringify(
      io.connection.connections.map((c) => ({
        id: c.node.id,
        ioId: c.ioId,
      })),
    )
    : undefined;
};

export const getIoInformation = (io: HTMLLIElement): NodeConnectionInfo => {
  const ioId = parseInt(io.dataset.id as string);
  const nodeId = parseInt(io.dataset.nodeId as string);
  const type = io.dataset.type as IOTypeName;
  const connected = io.dataset.connected === 'true';
  let connections: NodeConnectionIds | undefined;
  if (connected) {
    connections = JSON.parse(
      io.dataset.connections as string,
    ) as NodeConnectionIds;
  }
  return { ioId, nodeId, type, connected, connections };
};

export const updateIoRow = (
  row: HTMLLIElement,
  io: NodeIOWithId,
  setIoValue: (value: DefinedIOType) => void,
) => {
  const isOutput = io.kind === 'output';
  const isConnected = io.connection?.connected ?? false;
  // update row data attrs with updated data
  storeIoInformation(row, io);

  // check if only value changed or if edit components should (dis)appear
  const shouldRendererEditComponent =
    io.editable !== row.classList.contains(cssSelectors.ioRow.editable) ||
    isConnected !== row.classList.contains(cssSelectors.ioRow.connected);

  // update row visual elements and show / hide edit components
  row.classList.toggle(cssSelectors.ioRow.editable, io.editable);
  row.classList.toggle(cssSelectors.ioRow.connected, isConnected);

  const container = row.querySelector<HTMLDivElement>(
    cssClass(cssSelectors.ioRow.container),
  );
  const indicator = row.querySelector<HTMLDivElement>(
    cssClass(cssSelectors.ioRow.indicator),
  );
  // if any child is missing, recreate io row content from scratch;
  if (container && indicator) {
    updateIoRowIndicator(indicator, io);
    updateIoRowContainer(
      container,
      io,
      shouldRendererEditComponent,
      setIoValue,
    );
  } else {
    const newContainer = createIORowContainer(io, setIoValue);
    const newIndicator = createIoRowIndicator(io);
    row.replaceChildren(
      ...(isOutput
        ? [newContainer, newIndicator]
        : [newIndicator, newContainer]),
    );
  }
};

export const updateIoRowEditComponent = (
  container: HTMLDivElement,
  io: NodeIOWithId,
) => {
  const getEditComponent = <T extends HTMLElement>(
    selector: keyof typeof cssSelectors.ioRow.edit,
  ): T | null =>
      container.querySelector(cssClass(cssSelectors.ioRow.edit[selector]));

  switch (io.type) {
  case 'number':
  case 'string': {
    const textInput = getEditComponent<HTMLInputElement>('textInput');
    textInput && Input.setValue(textInput, io.value as string | number);
    break;
  }
  case 'boolean': {
    const toggle = getEditComponent<HTMLDivElement>('toggle');
    toggle && Toggle.set(toggle, io.value as boolean);
    break;
  }
  }
};

export const updateIoRowContainer = (
  container: HTMLDivElement,
  io: NodeIOWithId,
  shouldRerender: boolean,
  setIoValue: (value: DefinedIOType) => void,
) => {
  if (shouldRerender) {
    const name = createIoRowName(io.name);
    const children = [name];
    const editComponent = createIORowEditComponentIfNeeded(io, setIoValue);
    editComponent && children.push(editComponent);
    container.replaceChildren(...children);
  } else {
    // only update edit components
    updateIoRowEditComponent(container, io);
  }
};

export const updateIoRowIndicator = (
  indicator: HTMLDivElement,
  io: NodeIOWithId,
) => {
  const isConnected = io.connection?.connected ?? false;
  !!indicator &&
    indicator.classList.toggle(cssSelectors.ioRow.connected, isConnected);
};
