import './styles/vars.scss';
import './style.css';
import './styles/components.scss';
import './styles/renderer.scss';
import './styles/ui.sass';
import { Runtime } from './runtime/runtime';
import { UIManager } from './ui/uiManager';

const runtime = new Runtime();

// runtime.createNode('value::number', { x: 100, y: 100 });
// runtime.createNode('value::number', { x: 100, y: 300 });
// runtime.createNode('value::boolean', { x: 100, y: 300 });
// runtime.createNode('value::string', { x: 100, y: 500 });
// runtime.createNode('value::object', { x: 100, y: 650 });
// runtime.createNode('math::add', { x: 400, y: 100 });
// runtime.createNode('object::property::create', { x: 400, y: 100 });
// runtime.createNode('booleanmath::and', { x: 400, y: 300 });
// runtime.createNode('booleanmath::not', { x: 400, y: 500 });
// runtime.createNode('string::join', { x: 400, y: 650 });
// runtime.createNode('logic::currentindex', { x: 100, y: 300 });
// runtime.createNode('logic::forloop', { x: 400, y: 300 });
// runtime.createNode('runtime::output', { x: 700, y: 300 });

// TODO: link ui manager to runtime
new UIManager({
  runtime,
  target: document.body,
});
// runtime.setNodeIoValue(0, 0, 123, 'output');
