import { Node } from '../../node';
import { defaultValues, defineNodeIO } from '../../defaults';
import { isUndefined } from '../../../utils/data';

export class GetObjectPropertyNode extends Node<
  ['object', 'string'],
  ['property', 'any']
> {
  constructor() {
    super({
      inputs: [
        defineNodeIO('Object', 'object'),
        defineNodeIO('Property name', 'string', true, 'prop'),
      ],
      outputs: [
        defineNodeIO('Property', 'property'),
        defineNodeIO('Property value', 'any'),
      ],
      operation: ([object, propName]) => {
        const propValue = object.value[propName.value];
        if (isUndefined(propValue))
          return [
            {
              name: 'Property',
              type: 'property',
              value: defaultValues.property(),
              tempType: 'property',
            },
            {
              name: 'Property value',
              type: 'any',
              value: defaultValues.any(),
              tempType: 'property',
            },
          ];
        const propType = object.value.__propTypes[propName.value];
        return [
          {
            name: 'Property',
            type: 'property',
            value: {
              kind: 'property',
              value: propValue,
              type: propType,
              name: propName.value,
            },
          },
          {
            name: 'Property value',
            type: 'any',
            value: propValue,
            tempType: propType,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Get property',
      kind: 'object::property::get',
      type: 'property',
      category: 'base',
    });
  }
}
