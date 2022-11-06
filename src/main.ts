import './styles/vars.scss';
import './style.css';
import './styles/components.scss';
import './styles/renderer.scss';
import { Runtime } from './runtime/runtime';

const runtime = new Runtime();

runtime.createNode('value::number', { x: 100, y: 100 });
runtime.createNode('value::boolean', { x: 100, y: 300 });
runtime.createNode('value::string', { x: 100, y: 500 });
runtime.createNode('value::object', { x: 100, y: 700 });
runtime.createNode('math::add', { x: 400, y: 100 });
runtime.createNode('booleanmath::and', { x: 400, y: 400 });

runtime.setNodeIoValue(0, 0, 123, 'output');

const result = await runtime.nodes[1].execute();

console.log(result);
