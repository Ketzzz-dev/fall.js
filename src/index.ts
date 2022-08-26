import assert from 'assert'

let canvas = document.getElementById('main-canvas') as HTMLCanvasElement

const GL = canvas.getContext('webgl2')

assert(GL != null, new Error('Your browser is shit!'))

const VERT_SHADER_SRC = `#version 300 es
     
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

uniform vec2 u_resolution;
 
// all shaders have a main function
void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
 
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;
 
    gl_Position = vec4(clipSpace, 0, 1);
}
`
 
const FRAG_SHADER_SRC = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
    // Just set the output to a constant reddish-purple
    outColor = vec4(1, 0, 0, 1);
}
`
enum ShaderType {
    VERTEX = GL.VERTEX_SHADER,
    FRAGMENT = GL.FRAGMENT_SHADER
}

const createShader = (type: ShaderType, src: string): WebGLShader => {
    let shader = GL.createShader(type)!

    GL.shaderSource(shader, src)
    GL.compileShader(shader)

    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) throw new Error(GL.getShaderInfoLog(shader)!)

    return shader
}
const createProgram = (vertShader: WebGLShader, fragShader: WebGLShader): WebGLProgram => {
    let program = GL.createProgram()!

    GL.attachShader(program, vertShader)
    GL.attachShader(program, fragShader)
    GL.linkProgram(program)

    if (!GL.getProgramParameter(program, GL.LINK_STATUS)) throw new Error(GL.getProgramInfoLog(program)!)

    return program
}

const resizeCanvas = (canvas: HTMLCanvasElement): void => {
    let displayWidth = canvas.clientWidth
    let displayHeight = canvas.clientHeight

    if (canvas.width != displayWidth || canvas.height != displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
    }
}

let vertShader = createShader(ShaderType.VERTEX, VERT_SHADER_SRC)
let fragShader = createShader(ShaderType.FRAGMENT, FRAG_SHADER_SRC)
let program = createProgram(vertShader, fragShader)

let positionAttributeLocation = GL.getAttribLocation(program, 'a_position')
let positionBuffer = GL.createBuffer()!

let resolutionUniformLocation = GL.getUniformLocation(program, 'u_resolution')!

GL.bindBuffer(GL.ARRAY_BUFFER, positionBuffer)

let positions = [
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30,
]

GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(positions), GL.STATIC_DRAW)

let vertexArrayObject = GL.createVertexArray()!

GL.bindVertexArray(vertexArrayObject)
GL.enableVertexAttribArray(positionAttributeLocation)
GL.vertexAttribPointer(positionAttributeLocation, 2, GL.FLOAT, false, 0, 0)

resizeCanvas(GL.canvas)

GL.viewport(0, 0, GL.canvas.width, GL.canvas.height)

GL.clearColor(0, 0, 0, 0)
GL.clear(GL.COLOR_BUFFER_BIT)

GL.useProgram(program)
GL.uniform2f(resolutionUniformLocation, GL.canvas.width, GL.canvas.height)

GL.bindVertexArray(vertexArrayObject)
GL.drawArrays(GL.TRIANGLES, 0, 6)

export {}

// import { RigidBody } from './physics/RigidBody'
// import { Shapes } from './physics/Shapes'
// import { Vector } from './physics/Vector'
// import { FMath } from './utility/FMath'
// import { Random } from './utility/Random'
// import { Engine } from './core/Engine'

// const ENGINE = new Engine({
//     tickRate: 50,
//     renderer: {
//         width: innerWidth,
//         height: innerHeight
//     }
// })

// document.body.appendChild(ENGINE.renderer.canvas)

// let { min, max } = ENGINE.renderer.camera.bounds
// let padding = Vector.multiply(.1, Vector.subtract(max, min))

// let ground = Shapes.rectangle({
//     position: new Vector(0, max.y - padding.y), width: (max.x - min.x) - padding.x, height: 3,
//     density: 3, restitution: 0.2, isStatic: true
// })

// ENGINE.world.addBody(ground)

// let platformA = Shapes.rectangle({
//     position: new Vector(min.x + padding.x * 3, min.y + padding.y * 5.5), rotation: .175 * FMath.PI_OVER_TWO,
//     width: .37 * ((max.x - min.x) - padding.x), height: 2,
//     density: 3, restitution: 0.2, isStatic: true
// })

// ENGINE.world.addBody(platformA)

// let platformB = Shapes.rectangle({
//     position: new Vector(max.x - padding.x * 3, min.y + padding.y * 4), rotation: -.175 * FMath.PI_OVER_TWO,
//     width: .37 * ((max.x - min.x) - padding.x), height: 2,
//     density: 3, restitution: 0.2, isStatic: true
// })

// ENGINE.world.addBody(platformB)

// for (let i = 0; i < 20; i++) {
//     let x = Random.float(min.x + padding.x * 2, max.x - padding.x * 2)
//     let y = Random.float(min.y + padding.y, 0)
//     let rotation = Random.float(0, FMath.TWO_PI)
//     let radius = Random.float(1.2, 1.7)
//     let sides = Random.integer(2, 5) * 2 - 1 

//     let body: RigidBody

//     if (Random.boolean(1)) body = Shapes.polygon({
//         position: new Vector(x, y), rotation, radius, sides,
//         density: 2.5, restitution: 0.3
//     })
//     else body = Shapes.circle({
//         position: new Vector(x, y), rotation, radius,
//         density: 2.5, restitution: 0
//     })

//     ENGINE.world.addBody(body)
// }

// console.log('WILL ALL FEMALES PLEASE MOVE TO #MEMES, WE ARE PLAYING BTD6!!!')