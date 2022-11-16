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
import { MathAbsoluteNode } from './number/math/absolute';
import { MathInvertNode } from './number/math/invert';

export const NumberNodeKeys = [
  'number::value',
  'number::math::add',
  'number::math::subtract',
  'number::math::multiply',
  'number::math::divide',
  'number::math::invert',
  'number::math::absolute',
] as const;

export const BooleanNodeKeys = [
  'boolean::value',
  'boolean::math::and',
  'boolean::math::or',
  'boolean::math::nand',
  'boolean::math::nor',
  'boolean::math::xor',
  'boolean::math::xnor',
  'boolean::math::not',
] as const;

const GenericNodeKeys = [
  'generic::node',
  'generic::math',
  'generic::value',
  'generic::booleanmath',
] as const;

export const StringNodeKeys = [
  'string::value',
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
  'object::value',
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
  'number::math::add': AddMathNode,
  'number::math::subtract': SubtractMathNode,
  'number::math::multiply': MultiplyMathNode,
  'number::math::divide': DivideMathNode,
  'number::math::absolute': MathAbsoluteNode,
  'number::math::invert': MathInvertNode,
  'number::value': NumberValueNode,
  'string::value': StringValueNode,
  'object::value': ObjectValueNode,
  'boolean::value': BooleanValueNode,
  'boolean::math::and': AndBooleanMathNode,
  'boolean::math::or': OrBooleanMathNode,
  'boolean::math::nand': NandBooleanMathNode,
  'boolean::math::nor': NorBooleanMathNode,
  'boolean::math::xor': XOrBooleanMathNode,
  'boolean::math::xnor': XNorBooleanMathNode,
  'boolean::math::not': NotBooleanMathNode,
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
