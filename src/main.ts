import './styles/vars.css'
import './style.css'
import './styles/renderer.scss'
import { Runtime } from "./runtime/runtime";


const runtime = new Runtime()

runtime.createNode('value::number')
runtime.createNode('math::add')
runtime.createNode('value::boolean')

runtime.connectNodes({
  outputNode: {
    id: 0,
    ioId: 0,
  },
  inputNode: {
    id: 1,
    ioId: 1,
  }
})
runtime.connectNodes({
  outputNode: {
    id: 2,
    ioId: 0,
  },
  inputNode: {
    id: 1,
    ioId: 0,
  }
})

runtime.nodes[0].setValue(123)

const result = await runtime.nodes[1].execute()

console.log(result)