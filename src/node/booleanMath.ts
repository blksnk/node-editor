import {
  NodeIODefinition,
  NodeOperation,
  NodeOperationArgument,
} from './node.types';
import { Node } from './node';

export class BooleanMathNode extends Node<boolean, 'boolean'> {
  constructor(operation: NodeOperation<boolean, 'boolean'>) {
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
    const operation: NodeOperation<boolean, 'boolean'> = ([
      a,
      b,
    ]: NodeOperationArgument<boolean, 'boolean'>[]) => {
      return {
        name: 'Result',
        type: 'boolean',
        value: a.value && b.value,
      };
    };
    super(operation);
    this.setupSelf({
      title: 'And Gate',
    });
  }
}

export class OrBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<boolean, 'boolean'> = ([
      a,
      b,
    ]: NodeOperationArgument<boolean, 'boolean'>[]) => {
      return {
        name: 'Result',
        type: 'boolean',
        value: a.value || b.value,
      };
    };
    super(operation);
    this.setupSelf({
      title: 'Or Gate',
    });
  }
}

export class NandBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<boolean, 'boolean'> = ([
      a,
      b,
    ]: NodeOperationArgument<boolean, 'boolean'>[]) => {
      return {
        name: 'Result',
        type: 'boolean',
        value: !(a.value && b.value),
      };
    };
    super(operation);
    this.setupSelf({
      title: 'Not And Gate',
    });
  }
}

export class NorBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<boolean, 'boolean'> = ([
      a,
      b,
    ]: NodeOperationArgument<boolean, 'boolean'>[]) => {
      return {
        name: 'Result',
        type: 'boolean',
        value: !(a.value || b.value),
      };
    };
    super(operation);
    this.setupSelf({
      title: 'Not Or Gate',
    });
  }
}

export class XOrBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<boolean, 'boolean'> = ([
      a,
      b,
    ]: NodeOperationArgument<boolean, 'boolean'>[]) => {
      return {
        name: 'Result',
        type: 'boolean',
        value: (a.value || b.value) && !(a.value && b.value),
      };
    };
    super(operation);
    this.setupSelf({
      title: 'Exclusive Or Gate',
    });
  }
}

export class XNorBooleanMathNode extends BooleanMathNode {
  constructor() {
    const operation: NodeOperation<boolean, 'boolean'> = ([
      a,
      b,
    ]: NodeOperationArgument<boolean, 'boolean'>[]) => {
      return {
        name: 'Result',
        type: 'boolean',
        value: a.value === b.value,
      };
    };
    super(operation);
    this.setupSelf({
      title: 'Exclusive Nor Gate',
    });
  }
}

export class NotBooleanMathNode extends Node<boolean, 'boolean'> {
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
    const operation: NodeOperation<boolean, 'boolean'> = ([
      v,
    ]: NodeOperationArgument<boolean, 'boolean'>[]) => {
      return {
        name: 'Inverse',
        type: 'boolean',
        value: !v.value,
      };
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
    });
  }
}
