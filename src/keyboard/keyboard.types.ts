export type KeyboardEventType = 'keyup' | 'keydown' | 'change' | 'all';

export interface KeyboardEventPayload {
  eventType: KeyboardEventType;
  key: string;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  ctrl: boolean;
  keys: {
    [k: string]: boolean;
  };
}

export type KeyboardEventCallback = (e: KeyboardEventPayload) => void;

export interface KeyboardListener {
  eventType: KeyboardEventType;
  callback: KeyboardEventCallback;
}
