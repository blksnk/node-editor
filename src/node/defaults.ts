import {
  DefinedIOType,
  IOType,
  IOTypeName,
  NodeIODefinition,
  PropertyIOType,
} from './node.types';

export const defaultValues = {
  number: (): number => 0,
  string: (): string => '',
  object: (): Record<string, Exclude<unknown, undefined>> => ({}),
  boolean: (): boolean => false,
  any: (): unknown => undefined,
  property: (
    name: string,
    type: IOTypeName,
  ): PropertyIOType<IOType, IOTypeName> => ({
    kind: 'property',
    value: (this as unknown as typeof defaultValues)[type](name, type),
    name,
    type,
  }),
  undef: () => undefined,
  'string[]': (): string[] => [],
  'number[]': (): number[] => [],
  'object[]': (): Record<string, unknown>[] => [],
  'boolean[]': (): boolean[] => [],
  'any[]': (): unknown[] => [],
  'property[]': () => [],
};

export const defineNodeIO = (
  name: string,
  type: IOTypeName,
  editable = false,
  defaultValue?: DefinedIOType,
): NodeIODefinition => ({
  name,
  type,
  value: defaultValue ?? defaultValues[type](name, type),
  editable,
});
