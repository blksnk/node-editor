import { Node } from '../node';
import { defineNodeIO } from '../defaults';

export class BranchLogicNode extends Node<['boolean', 'any', 'any'], ['any']> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Condition', 'boolean', true),
        defineNodeIO('True', 'any'),
        defineNodeIO('False', 'any'),
      ],
      outputs: [defineNodeIO('Result', 'any', false)],
      operation: ([condition, ifTrue, ifFalse]) => {
        return [
          {
            name: 'False',
            type: 'any',
            value: condition.value ? ifTrue.value : ifFalse.value,
            tempType: condition.value ? ifTrue.type : ifFalse.value,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Branch',
      type: 'any',
      category: 'logic',
      kind: 'logic::branch',
    });
  }

  override async updateOutputTypes() {
    await super.updateOutputTypes();
    console.log('update output type');
    const inputs = await this.fetchInputValues();
    console.log(inputs);
    const [condition, branchA, branchB] = inputs;
    const output = this.getOutput(0);
    if (!condition || !branchA || !branchB || !output) return;

    // const bothSameType =
    //   isDefined(branchA.type) &&
    //   isDefined(branchB.type) &&
    //   branchA.type === branchB.type;

    output.type = condition.value ? branchA.type : branchB.type;
    console.log(condition.value, output.type);

    // if both connected inputs are of same type then update output with this type
  }
}
