import { CurrentIndexLogicNode } from './logic/currentIndex';
import { ForLoopLogicNode } from './logic/forLoop';
import { BranchLogicNode } from './logic/branch';
import { LogicCompareNode } from './logic/compare';
import { AndBooleanMathNode } from './boolean/gates/and';
import { XNorBooleanMathNode } from './boolean/gates/nxor';
import { NotBooleanMathNode } from './boolean/gates/not';
import { OrBooleanMathNode } from './boolean/gates/or';
import { XOrBooleanMathNode } from './boolean/gates/xor';
import { NandBooleanMathNode } from './boolean/gates/nand';
import { NorBooleanMathNode } from './boolean/gates/nor';
import { BooleanValueNode } from './boolean/value';
import { MultiplyMathNode } from './number/math/multiply';
import { SubtractMathNode } from './number/math/subtract';
import { NumberValueNode } from './number/value';
import { DivideMathNode } from './number/math/divide';
import { AddMathNode } from './number/math/add';
import { ObjectValueNode } from './object/value';
import { CreateObjectPropertyNode } from './object/property/create';
import { RuntimeOutputNode } from './runtime/output';
import { RuntimeLogNode } from './runtime/log';
import { StringValueNode } from './string/value';
import { StringPrependNode } from './string/methods/prepend';
import { StringDeleteNode } from './string/methods/delete';
import { StringAppendNode } from './string/methods/append';
import { StringDeleteAtNode } from './string/methods/deleteAt';
import { StringSliceNode } from './string/methods/slice';
import { StringLengthNode } from './string/methods/length';
import { StringReplaceNode } from './string/methods/replace';
import { StringJoinNode } from './string/methods/join';
import { GetObjectPropertyNode } from './object/property/get';
import { SetObjectPropertyNode } from './object/property/set';
import { GetObjectPropertyValueNode } from './object/property/value';
import { DeleteObjectPropertyNode } from './object/property/delete';
import { ObjectMergeNode } from './object/merge';

export const NumberNodeKeys = [
  'value::number',
  'math::add',
  'math::subtract',
  'math::multiply',
  'math::divide',
] as const;

export const BooleanNodeKeys = [
  'value::boolean',
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

export const StringNodeKeys = [
  'value::string',
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
  'logic::branch',
  'logic::compare',
  'logic::forloop',
  'logic::currentindex',
] as const;

export const ObjectNodeKeys = [
  'value::object',
  'object::merge',
  'object::property::create',
  'object::property::get',
  'object::property::set',
  'object::property::value',
  'object::property::delete',
] as const;

const AllNodeKeys = [
  ...NumberNodeKeys,
  ...BooleanNodeKeys,
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
  'object::property::create': CreateObjectPropertyNode,
  'object::property::get': GetObjectPropertyNode,
  'object::property::set': SetObjectPropertyNode,
  'object::property::value': GetObjectPropertyValueNode,
  'object::property::delete': DeleteObjectPropertyNode,
  'object::merge': ObjectMergeNode,
} as const;

export type AnyGenericNodeKey = typeof GenericNodeKeys[number];

export type AnyNodeKey = typeof AllNodeKeys[number];
