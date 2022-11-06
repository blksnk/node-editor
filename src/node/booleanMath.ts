import { NodeIODefinition, NodeOperation } from './node.types';
import { Node } from './node';

export class BooleanMathNode extends Node<['boolean', 'boolean'], ['boolean']> {
  constructor(operation: NodeOperation<['boolean', 'boolean'], ['boolean']>) {
    const inputs: NodeIODefinition[] = [
      {
        name: 'A',
        type: 'boolean',
        value: false,
        editable: true,
      },
      {
        name: 'B',
        type: 'boolean',
        value: false,
        editable: true,
      },
    ];
    const outputs: NodeIODefinition[] = [
      {
        name: 'Result',
        type: 'boolean',
      },
    ];
    super({
      inputs,
      outputs,
      operation,
    });
    this.setupSelf({
      type: 'boolean',
      category: 'booleanMath',
    });
  }
}

export class AndBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      a,
      b,
    ]) => {
      return [
        {
          name: 'Result',
          type: 'boolean',
          value: a.value && b.value,
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'And Gate',
      kind: 'booleanmath::and',
    });
  }
}

export class OrBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      a,
      b,
    ]) => {
      return [
        {
          name: 'Result',
          type: 'boolean',
          value: a.value || b.value,
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Or Gate',
      kind: 'booleanmath::or',
    });
  }
}

export class NandBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      a,
      b,
    ]) => {
      return [
        {
          name: 'Result',
          type: 'boolean',
          value: !(a.value && b.value),
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Not And Gate',
      kind: 'booleanmath::nand',
    });
  }
}

export class NorBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      a,
      b,
    ]) => {
      return [
        {
          name: 'Result',
          type: 'boolean',
          value: !(a.value || b.value),
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Not Or Gate',
      kind: 'booleanmath::nor',
    });
  }
}

export class XOrBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      a,
      b,
    ]) => {
      return [
        {
          name: 'Result',
          type: 'boolean',
          value: (a.value || b.value) && !(a.value && b.value),
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Exclusive Or Gate',
      kind: 'booleanmath::xor',
    });
  }
}

export class XNorBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      a,
      b,
    ]) => {
      return [
        {
          name: 'Result',
          type: 'boolean',
          value: a.value === b.value,
        },
      ];
    };
    super(operation);
    this.setupSelf({
      title: 'Exclusive Nor Gate',
      kind: 'booleanmath::xnor',
    });
  }
}

export class NotBooleanMathNode extends Node<
  ['boolean', 'boolean'],
  ['boolean']
> {
  constructor() {
    const inputs: NodeIODefinition[] = [
      {
        name: 'Value',
        type: 'boolean',
        value: 0,
      },
    ];
    const outputs: NodeIODefinition[] = [
      {
        name: 'Inverse',
        type: 'boolean',
      },
    ];
    const operation: NodeOperation<['boolean', 'boolean'], ['boolean']> = ([
      v,
    ]) => {
      return [
        {
          name: 'Inverse',
          type: 'boolean',
          value: !v.value,
        },
      ];
    };
    super({
      inputs,
      outputs,
      operation,
    });
    this.setupSelf({
      type: 'boolean',
      category: 'booleanMath',
      title: 'Not Gate',
      kind: 'booleanmath::not',
    });
  }
}
