import { element } from '../../utils/document';

type StringOrNumber<T extends 'number' | 'string'> = T extends 'number'
  ? number
  : string;

export const Input = <T extends 'number' | 'string'>(
  type: T,
  onChange?: (v: StringOrNumber<T>) => void,
  value?: T extends 'number' ? number : string,
) => {
  const input = element<HTMLInputElement>('input');
  input.type = type;
  input.value = String(value ?? '');

  input.classList.add('ui__input');
  input.placeholder = type === 'number' ? '1.0' : 'Hello World';

  input.addEventListener('input', (e) => {
    const { value } = e.target as HTMLInputElement;
    const v = type === 'number' ? parseInt(value) : value;
    onChange && onChange(v as StringOrNumber<T>);
  });

  return input;
};

type InputElement = ReturnType<typeof Input>;

const isDifferentValue = (
  input: InputElement,
  newValue: string | number,
): boolean => {
  return input.value !== String(newValue);
};

Input.setValue = <T extends string | number>(input: InputElement, value: T) => {
  if (isDifferentValue(input, value)) {
    input.value = typeof value === 'string' ? value : String(value);
  }
};

Input.clear = (input: InputElement) => {
  input.value = '';
};
