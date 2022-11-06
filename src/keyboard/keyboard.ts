export class KeyboardHandler {
  pressedDownKeys: string[] = [];
  shift = false;
  alt = false;
  meta = false;
  ctrl = false;

  constructor() {
    this.initEvents();
  }

  initEvents = () => {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  };

  setMetaKeys(e: KeyboardEvent) {
    this.shift = e.shiftKey;
    this.alt = e.altKey;
    this.meta = e.metaKey;
    this.ctrl = e.ctrlKey;
  }

  onKeyDown(e: KeyboardEvent) {
    this.setMetaKeys(e);
  }

  onKeyUp(e: KeyboardEvent) {
    this.setMetaKeys(e);
  }
}
