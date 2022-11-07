import { Node } from '../node';
import { defineNodeIO } from '../defaults';
import { NodeOperationArgument } from '../node.types';
import { isUndefined } from '../../utils/data';

export class ForLoopLogicNode extends Node<
  ['number', 'number', 'any'],
  ['any[]']
> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Start', 'number', true, 0),
        defineNodeIO('Iteration count', 'number', true, 10),
        defineNodeIO('Operation', 'any', true, 0),
      ],
      outputs: [defineNodeIO('Results', 'any[]')],
      operation: async (inputs) => {
        const [start, iterationCount, firstOperation] = inputs;
        // store operation results, start with first one
        const restOperations: NodeOperationArgument<unknown, 'any'>[] = [];

        // execute inputs again
        for (
          let i = start.value + 1;
          i < start.value + iterationCount.value;
          i++
        ) {
          const iterationInputResults = await this.fetchInputValues();
          const operationValue = {
            ...iterationInputResults[2],
          } as NodeOperationArgument<unknown, 'any'>;
          restOperations.push(operationValue);
        }
        const operationResults = [firstOperation, ...restOperations].map(
          ({ value, type }) => ({
            value,
            type,
          }),
        );

        // reset current index start for successive executions
        this.resetCurrentIndex(start.value);
        return [
          {
            name: 'Results',
            value: operationResults,
            type: 'any[]',
          },
        ];
      },
    });
    this.setupSelf({
      title: 'For Loop',
      type: 'any',
      category: 'logic',
      kind: 'logic::forloop',
    });
  }

  resetCurrentIndex(startIndex: number) {
    // traverse nodes connected to operation input to find current index node if preset
    const currentIndexNode = this.getSpecificInputNode('logic::currentindex');
    if (isUndefined(currentIndexNode)) return;
    // set current index
    currentIndexNode.setIoValue(0, startIndex, 'output');
  }
}
