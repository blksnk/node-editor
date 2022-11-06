import {
  AddMathNode,
  DivideMathNode,
  MathNode,
  MultiplyMathNode,
  SubtractMathNode,
} from './math';
import {
  BooleanValueNode,
  NumberValueNode,
  ObjectValueNode,
  StringValueNode,
  ValueNode,
} from './value';
import {
  AndBooleanMathNode,
  BooleanMathNode,
  NandBooleanMathNode,
  NorBooleanMathNode,
  NotBooleanMathNode,
  OrBooleanMathNode,
  XNorBooleanMathNode,
  XOrBooleanMathNode,
} from './booleanMath';
import {
  StringAppendNode,
  StringDeleteAtNode,
  StringDeleteNode,
  StringJoinNode,
  StringLengthNode,
  StringPrependNode,
  StringReplaceNode,
  StringSliceNode,
} from './string';

export const MathNodeIndex = {
  'math::add': AddMathNode,
  'math::subtract': SubtractMathNode,
  'math::multiply': MultiplyMathNode,
  'math::divide': DivideMathNode,
} as const;

const MathNodeKeys = [
  'math::add',
  'math::subtract',
  'math::multiply',
  'math::divide',
] as const;

export const ValueNodeIndex = {
  'value::number': NumberValueNode,
  'value::string': StringValueNode,
  'value::object': ObjectValueNode,
  'value::boolean': BooleanValueNode,
} as const;

const ValueNodeKeys = [
  'value::number',
  'value::string',
  'value::object',
  'value::boolean',
] as const;

export const BooleanMathNodeIndex = {
  'booleanmath::and': AndBooleanMathNode,
  'booleanmath::or': OrBooleanMathNode,
  'booleanmath::nand': NandBooleanMathNode,
  'booleanmath::nor': NorBooleanMathNode,
  'booleanmath::xor': XOrBooleanMathNode,
  'booleanmath::xnor': XNorBooleanMathNode,
  'booleanmath::not': NotBooleanMathNode,
};

const BooleanMathNodeKeys = [
  'booleanmath::and',
  'booleanmath::or',
  'booleanmath::nand',
  'booleanmath::nor',
  'booleanmath::xor',
  'booleanmath::xnor',
  'booleanmath::not',
] as const;

export const GenericNodeIndex = {
  'generic::node': Node,
  'generic::math': MathNode,
  'generic::value': ValueNode,
  'generic::booleanmath': BooleanMathNode,
};

const GenericNodeKeys = [
  'generic::node',
  'generic::math',
  'generic::value',
  'generic::booleanmath',
] as const;

const StringNodeKeys = [
  'string::length',
  'string::slice',
  'string::replace',
  'string::join',
  'string::append',
  'string::prepend',
  'string::delete',
  'string::deleteat',
] as const;

const AllNodeKeys = [
  ...MathNodeKeys,
  ...ValueNodeKeys,
  ...BooleanMathNodeKeys,
  ...StringNodeKeys,
] as const;

export const NodeIndex = {
  'math::add': AddMathNode,
  'math::subtract': SubtractMathNode,
  'math::multiply': MultiplyMathNode,
  'math::divide': DivideMathNode,
  'value::number': NumberValueNode,
  'value::string': StringValueNode,
  'value::object': ObjectValueNode,
  'value::boolean': BooleanValueNode,
  'booleanmath::and': AndBooleanMathNode,
  'booleanmath::or': OrBooleanMathNode,
  'booleanmath::nand': NandBooleanMathNode,
  'booleanmath::nor': NorBooleanMathNode,
  'booleanmath::xor': XOrBooleanMathNode,
  'booleanmath::xnor': XNorBooleanMathNode,
  'booleanmath::not': NotBooleanMathNode,
  'string::length': StringLengthNode,
  'string::slice': StringSliceNode,
  'string::replace': StringReplaceNode,
  'string::join': StringJoinNode,
  'string::append': StringAppendNode,
  'string::prepend': StringPrependNode,
  'string::delete': StringDeleteNode,
  'string::deleteat': StringDeleteAtNode,
} as const;

export type AnyMathNodeKey = typeof MathNodeKeys[number];
export type AnyBooleanMathNodeKey = typeof BooleanMathNodeKeys[number];
export type AnyValueNodeKey = typeof ValueNodeKeys[number];
export type AnyGenericNodeKey = typeof GenericNodeKeys[number];

export type AnyNodeKey = typeof AllNodeKeys[number];

export const isMathNodeKey = (k: AnyNodeKey): k is AnyMathNodeKey =>
  k.split('::')[0] === 'math';
export const isValueNodeKey = (k: AnyNodeKey): k is AnyValueNodeKey =>
  k.split('::')[0] === 'value';
export const isGenericNodeKey = (k: AnyNodeKey): k is AnyMathNodeKey =>
  k.split('::')[0] === 'generic';
export const isBooleanMathNodeKey = (
  k: AnyNodeKey,
): k is AnyBooleanMathNodeKey => k.split('::')[0] === 'booleanmath';
