import { Node } from './node';
import { NodeOperation } from './node.types';
import { defineNodeIO } from './defaults';

export class StringLengthNode extends Node<['string'], ['number']> {
  constructor() {
    const operation: NodeOperation<['string'], ['number']> = (inputs) => {
      const s = inputs[0];
      return [
        {
          name: 'Length',
          type: 'number',
          value: s.value.length,
        },
      ];
    };
    super({
      inputs: [defineNodeIO('String', 'string', true)],
      outputs: [defineNodeIO('Length', 'number', false, 0)],
      operation,
    });
    this.setupSelf({
      title: 'String Length',
      category: 'base',
      type: 'string',
      kind: 'string::length',
    });
  }
}

export class StringSliceNode extends Node<
  ['string', 'number', 'number'],
  ['string']
> {
  constructor() {
    const operation: NodeOperation<
      ['string', 'number', 'number'],
      ['string']
    > = (inputs) => {
      const [s, startIndex, endIndex] = inputs;
      return [
        {
          name: 'Slice',
          type: 'string',
          value: s.value.slice(startIndex.value, endIndex.value),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('String', 'string', true),
        defineNodeIO('Start Index', 'number', true, 0),
        defineNodeIO('End Index', 'number', true, 3),
      ],
      outputs: [defineNodeIO('Slice', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Slice',
      category: 'base',
      type: 'string',
      kind: 'string::slice',
    });
  }
}

export class StringReplaceNode extends Node<
  ['string', 'string', 'string', 'boolean'],
  ['string']
> {
  constructor() {
    const operation: NodeOperation<
      ['string', 'string', 'string', 'boolean'],
      ['string']
    > = (inputs) => {
      const [s, toReplace, replaceBy, replaceAll] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value: (replaceAll.value ? s.value.replaceAll : s.value.replace)(
            toReplace.value,
            replaceBy.value,
          ),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('Base string', 'string', true),
        defineNodeIO('To replace', 'string', true),
        defineNodeIO('Replace by', 'string', true),
        defineNodeIO('Replace all', 'boolean', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Replace',
      category: 'base',
      type: 'string',
      kind: 'string::replace',
    });
  }
}

export class StringJoinNode extends Node<['string[]', 'string'], ['string']> {
  constructor() {
    const operation: NodeOperation<['string[]', 'string'], ['string']> = (
      inputs,
    ) => {
      const [strings, joinWith] = inputs;
      console.log(inputs);
      return [
        {
          name: 'String',
          type: 'string',
          value: strings.value.join(joinWith.value),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('Strings', 'string[]', true),
        defineNodeIO('Join With', 'string', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Join',
      category: 'base',
      type: 'string',
      kind: 'string::join',
    });
  }
}

export class StringAppendNode extends Node<['string', 'string'], ['string']> {
  constructor() {
    const operation: NodeOperation<['string', 'string'], ['string']> = (
      inputs,
    ) => {
      const [string, toAppend] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value: string.value + toAppend.value,
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('Base string', 'string', true),
        defineNodeIO('To append', 'string', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Append',
      category: 'base',
      type: 'string',
      kind: 'string::append',
    });
  }
}

export class StringPrependNode extends Node<['string', 'string'], ['string']> {
  constructor() {
    const operation: NodeOperation<['string', 'string'], ['string']> = (
      inputs,
    ) => {
      const [string, toPrepend] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value: toPrepend.value + string.value,
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('Base string', 'string', true),
        defineNodeIO('To prepend', 'string', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Prepend',
      category: 'base',
      type: 'string',
      kind: 'string::prepend',
    });
  }
}

export class StringDeleteNode extends Node<['string', 'string'], ['string']> {
  constructor() {
    const operation: NodeOperation<['string', 'string'], ['string']> = (
      inputs,
    ) => {
      const [string, toDelete] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value: string.value.replace(toDelete.value, ''),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('String', 'string', true),
        defineNodeIO('To delete', 'string', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Delete',
      category: 'base',
      type: 'string',
      kind: 'string::delete',
    });
  }
}

export class StringDeleteAtNode extends Node<
  ['string', 'number', 'number'],
  ['string']
> {
  constructor() {
    const operation: NodeOperation<
      ['string', 'number', 'number'],
      ['string']
    > = (inputs) => {
      const [string, startIndex, endIndex] = inputs;
      return [
        {
          name: 'String',
          type: 'string',
          value:
            string.value.substring(0, startIndex.value) +
            string.value.substring(endIndex.value + 1),
        },
      ];
    };
    super({
      inputs: [
        defineNodeIO('String', 'string', true),
        defineNodeIO('Start index', 'number', true),
        defineNodeIO('End index', 'number', true),
      ],
      outputs: [defineNodeIO('String', 'string', false)],
      operation,
    });
    this.setupSelf({
      title: 'Delete At',
      category: 'base',
      type: 'string',
      kind: 'string::deleteat',
    });
  }
}
