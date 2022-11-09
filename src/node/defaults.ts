import {
  DefinedIOType,
  DefinedIOTypeName,
  IOType,
  IOTypeName,
  ObjectIOType,
  PropertyIOType,
} from './node.types';

export const defaultValues = {
  number: (): number => 0,
  string: (): string => '',
  object: (): ObjectIOType => ({
    __propTypes: {},
  }),
  boolean: (): boolean => false,
  any: (): unknown => undefined,
  property: (): PropertyIOType<IOType, IOTypeName> => ({
    kind: 'property',
    value: undefined,
    name: 'prop',
    type: 'any',
  }),
  undef: () => undefined,
  'string[]': (): string[] => [],
  'number[]': (): number[] => [],
  'object[]': (): ObjectIOType[] => [],
  'boolean[]': (): boolean[] => [],
  'any[]': (): DefinedIOTypeName[] => [],
  'property[]': () => [],
};

export const defineNodeIO = (
  name: string,
  type: IOTypeName,
  editable = false,
  defaultValue?: DefinedIOType,
) => ({
  name,
  type,
  value: defaultValue ?? defaultValues[type](),
  editable,
});
