import { IOTypeName, NodeWithId } from '../node/node.types';

export interface NodeConnection {
  inputNode: {
    node: NodeWithId;
    ioId: number;
    type: IOTypeName;
  };
  outputNode: {
    node: NodeWithId;
    ioId: number;
    type: IOTypeName;
  };
  id: number;
}

export interface NodeConnectionAttempt {
  inputNode: {
    id: number;
    ioId: number;
    type: IOTypeName;
  };
  outputNode: {
    id: number;
    ioId: number;
    type: IOTypeName;
  };
}

export interface NodeConnectionBreak {
  inputNode: {
    id: number;
    ioId: number;
    type: IOTypeName;
  };
  outputNode: {
    id: number;
    ioId: number;
    type: IOTypeName;
  };
}
