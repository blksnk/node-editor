import {
  AddMathNode,
  DivideMathNode,
  MultiplyMathNode,
  SubtractMathNode,
} from './math';
import {
  BooleanValueNode,
  NumberValueNode,
  ObjectValueNode,
  StringValueNode,
} from './value';
import {
  AndBooleanMathNode,
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
import { RuntimeLogNode, RuntimeOutputNode } from './runtime';
import { CurrentIndexLogicNode } from './logic/currentIndex';
import { ForLoopLogicNode } from './logic/forLoop';
import { BranchLogicNode } from './logic/branch';
import { LogicCompareNode } from './logic/compare';
import { CreatePropertyObjectNode } from './object/property';

const MathNodeKeys = [
  'math::add',
  'math::subtract',
  'math::multiply',
  'math::divide',
] as const;

const ValueNodeKeys = [
  'value::number',
  'value::string',
  'value::object',
  'value::boolean',
] as const;

const BooleanMathNodeKeys = [
  'booleanmath::and',
  'booleanmath::or',
  'booleanmath::nand',
  'booleanmath::nor',
  'booleanmath::xor',
  'booleanmath::xnor',
  'booleanmath::not',
] as const;

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

export const RuntimeNodeKeys = ['runtime::output', 'runtime::log'] as const;

export const LogicNodeKeys = [
  'logic::currentindex',
  'logic::forloop',
  'logic::branch',
  'logic::compare',
] as const;

export const ObjectNodeKeys = ['object::property::create'] as const;

const AllNodeKeys = [
  ...MathNodeKeys,
  ...ValueNodeKeys,
  ...BooleanMathNodeKeys,
  ...StringNodeKeys,
  ...RuntimeNodeKeys,
  ...LogicNodeKeys,
  ...ObjectNodeKeys,
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
  'runtime::output': RuntimeOutputNode,
  'runtime::log': RuntimeLogNode,
  'logic::currentindex': CurrentIndexLogicNode,
  'logic::forloop': ForLoopLogicNode,
  'logic::branch': BranchLogicNode,
  'logic::compare': LogicCompareNode,
  'object::property::create': CreatePropertyObjectNode,
} as const;

export type AnyGenericNodeKey = typeof GenericNodeKeys[number];

export type AnyNodeKey = typeof AllNodeKeys[number];
