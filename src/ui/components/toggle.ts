import { element } from '../../utils/document';

export const Toggle = (active: boolean, onChange: (bool: boolean) => void) => {
  const container = element<HTMLDivElement>('div');
  const handle = element<HTMLDivElement>('div');

  container.classList.add('ui__toggle');
  container.classList.toggle('active', active);
  setDataValue(container, active);
  handle.classList.add('ui__toggle__handle');
  container.append(handle);

  container.addEventListener('pointerdown', () => {
    const currentActive = container.classList.contains('active');
    onChange(!currentActive);
    container.classList.toggle('active', !currentActive);
  });
  return container;
};

type ToggleElement = ReturnType<typeof Toggle>;

const isDifferentValue = (toggleElement: ToggleElement, newValue: boolean) => {
  const currentValue = toggleElement.dataset.value === 'true';
  return currentValue !== newValue;
};

const setDataValue = (t: ToggleElement, value: boolean) => {
  t.dataset.value = String(value);
};

Toggle.set = (toggleElement: ToggleElement, value: boolean) => {
  if (isDifferentValue(toggleElement, value)) {
    toggleElement.classList.toggle('active', value);
    setDataValue(toggleElement, value);
  }
};

Toggle.toggle = (toggleElement: ToggleElement) => {
  toggleElement.classList.toggle('active');
  const currentValue = toggleElement.dataset.value === 'true';
  setDataValue(toggleElement, !currentValue);
};
