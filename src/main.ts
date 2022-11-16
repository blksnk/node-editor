import './styles/vars.scss';
import './style.css';
import './styles/components.scss';
import './styles/renderer.scss';
import './styles/ui.sass';
import { Runtime } from './runtime/runtime';

const runtime = new Runtime();

// runtime.createNode('number::value', { x: 100, y: 100 });
// runtime.createNode('number::value', { x: 100, y: 300 });
// runtime.createNode('boolean::value', { x: 100, y: 300 });
runtime.createNode('string::value', { x: 400, y: 260 });
runtime.setNodeIoValue(0, 0, 'test string', 'output');
// runtime.createNode('number::math::add', { x: 400, y: 100});
runtime.createNode('object::property::create', { x: 624, y: 300 });
// runtime.createNode('boolean::math::and', { x: 400, y: 300 });
// runtime.createNode('boolean::math::not', { x: 400, y: 500 });
// runtime.createNode('string::join', { x: 400, y: 650 });
// runtime.createNode('logic::currentindex', { x: 100, y: 300 });
// runtime.createNode('logic::forloop', { x: 400, y: 300 });
// runtime.setNodeIoValue(0, 0, 123, 'output');
runtime.createNode('object::value', { x: 700, y: 600 });
runtime.createNode('runtime::output', { x: 924, y: 600 });

runtime.renderer.onGlobalUp(new PointerEvent('pointerup'));
runtime.renderer.unselectAllCards(new PointerEvent('pointerdown'));

runtime.connectNodes({
  inputNode: {
    id: 1,
    ioId: 1,
  },
  outputNode: {
    id: 0,
    ioId: 0,
  },
});

runtime.connectNodes({
  inputNode: {
    id: 2,
    ioId: 0,
  },
  outputNode: {
    id: 1,
    ioId: 0,
  },
});

runtime.connectNodes({
  inputNode: {
    id: 3,
    ioId: 1,
  },
  outputNode: {
    id: 2,
    ioId: 0,
  },
});
