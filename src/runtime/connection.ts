import { DefinedIOTypeName, NodeWithId } from '../node/node.types';
import { NodeConnection } from './runtime.types';
import { findById, isDefined } from '../utils/data';

export const getUniqueConnections = (nodes: NodeWithId[]): NodeConnection[] => {
  return nodes
    .map((node) =>
      node.inputs.map((input) => {
        const outputNodeConnections = input.connection.connections.map((c) => {
          const node = findById(nodes, c.node.id as number);
          if (node === undefined) return undefined;
          const outputNode = findById(node.outputs, c.ioId);
          if (outputNode === undefined) return undefined;
          return {
            ioId: c.ioId,
            node,
            type: outputNode.type,
          };
        });
        const filteredOutputNodeConnections = outputNodeConnections.filter(
          (c) => isDefined(c),
        ) as {
          ioId: number;
          node: NodeWithId;
          type: DefinedIOTypeName;
        }[];
        if (filteredOutputNodeConnections.length === 0) return undefined;

        return filteredOutputNodeConnections.map((c) => ({
          inputNode: {
            node,
            ioId: input.id,
            type: input.type,
          },
          outputNode: c,
        }));
      }),
    )
    .flat(2)
    .filter((connection) => connection !== undefined)
    .map((c, index) => ({
      ...c,
      id: index,
    })) as NodeConnection[];
};
