import { DefinedIOTypeName, IOTypeName, NodeWithId } from '../node/node.types';
import { Runtime } from '../runtime/runtime';
import { KeyboardHandler } from '../keyboard/keyboard';

export interface RendererOptions {
  target: HTMLElement | HTMLBodyElement;
  runtime: Runtime;
  keyboard: KeyboardHandler;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface RendererNode<
  ITN extends IOTypeName[] = DefinedIOTypeName[],
  OTN extends IOTypeName[] = DefinedIOTypeName[],
> {
  node: NodeWithId<ITN, OTN>;
  card: HTMLElement;
  io: {
    inputs: HTMLLIElement[];
    outputs: HTMLLIElement[];
  };
  header: HTMLElement;
  id: number;
  position: Vec2;
}

export interface RendererConnection {
  outputNode: {
    id: number;
    ioId: number;
    position: Vec2;
    type: IOTypeName;
  };
  inputNode: {
    id: number;
    ioId: number;
    position: Vec2;
    type: IOTypeName;
  };
  id: number;
}

export type LineCommandFunction = (
  point: Vec2,
  index: number,
  points: Vec2[],
) => string;

export interface CompletedPendingRendererConnection {
  inputNode: RendererConnection['inputNode'];
  outputNode: RendererConnection['outputNode'];
  active: true;
}

export type PartialPendingRendererConnection =
  | {
      inputNode: RendererConnection['inputNode'];
      outputNode: undefined;
      active: true;
    }
  | {
      inputNode: undefined;
      outputNode: RendererConnection['outputNode'];
      active: true;
    };

export type EmptyPendingRendererConnection = {
  inputNode: undefined;
  outputNode: undefined;
  active: false;
};

export type PendingRendererConnection =
  | EmptyPendingRendererConnection
  | PartialPendingRendererConnection
  | CompletedPendingRendererConnection;
