import { Node } from '../node';
import { defineNodeIO } from '../defaults';

export class ObjectValueNode extends Node<['property[]'], ['object']> {
  constructor() {
    super({
      inputs: [defineNodeIO('Properties', 'property[]')],
      outputs: [defineNodeIO('Object', 'object')],
      operation: ([properties]) => {
        // create object from properties
        const normalizePropName = (n: string) => n.replaceAll(' ', '_');
        const object = Object.fromEntries([
          ...properties.value.map((prop) => [
            normalizePropName(prop.name),
            prop.value,
          ]),
          [
            '__propTypes',
            Object.fromEntries(
              properties.value.map((prop) => [
                normalizePropName(prop.name),
                prop.type,
              ]),
            ),
          ],
        ]);
        // inject prop types
        // object.__propTypes = Object.fromEntries(
        //   properties.value.map((prop) => [
        //     normalizePropName(prop.name),
        //     prop.type,
        //   ]),
        // )
        return [
          {
            name: 'Object',
            type: 'object',
            value: object,
          },
        ];
      },
    });
    this.setupSelf({
      title: 'Object',
      kind: 'value::object',
      type: 'object',
      category: 'value',
    });
  }
}
