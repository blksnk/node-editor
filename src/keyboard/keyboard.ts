import {
  KeyboardEventCallback,
  KeyboardEventType,
  KeyboardListener,
} from './keyboard.types';

export class KeyboardHandler {
  pressedDownKeys: { [k: string]: boolean } = {};
  shift = false;
  alt = false;
  meta = false;
  ctrl = false;
  listeners: KeyboardListener[] = [];
  lastKey: string | undefined = undefined;

  constructor() {
    this.initEvents();
  }

  public addListener(
    eventType: KeyboardEventType,
    callback: KeyboardEventCallback,
  ) {
    this.listeners.push({
      eventType,
      callback,
    });
  }

  public removeListener(
    eventType: KeyboardEventType,
    callback: KeyboardEventCallback,
  ) {
    const index = this.listeners.findIndex(
      (l) => l.eventType === eventType && l.callback === callback,
    );
    if (index < 0) return;
    this.listeners.splice(index, 1);
  }

  private initEvents = () => {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  };

  private onKeyDown(e: KeyboardEvent) {
    this.setMetaKeys(e);
    this.setKey(e.key, true);
    this.callListeners('keydown');
  }

  private onKeyUp(e: KeyboardEvent) {
    this.setMetaKeys(e);
    this.setKey(e.key, false);
    this.callListeners('keyup');
  }

  private setMetaKeys(e: KeyboardEvent) {
    this.shift = e.shiftKey;
    this.alt = e.altKey;
    this.meta = e.metaKey;
    this.ctrl = e.ctrlKey;
  }

  private setKey(key: string, value: boolean) {
    this.lastKey = key;
    const prevValue = { ...this.pressedDownKeys }[key];
    this.pressedDownKeys[key] = value;
    if (prevValue !== value) {
      this.callListeners('change');
    }
  }

  private callListeners(type: KeyboardEventType) {
    this.listeners
      .filter(({ eventType }) => eventType === type || eventType === 'all')
      .forEach((l) => {
        const payload = {
          eventType: type,
          keys: this.pressedDownKeys,
          shift: this.shift,
          alt: this.alt,
          meta: this.meta,
          ctrl: this.ctrl,
          key: this.lastKey as string,
        };
        l.callback(payload);
      });
  }
}
