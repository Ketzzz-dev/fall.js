import { TimeStep } from '@Core/TimeStep'
import { normalize } from '@FMath/Functions'
import { Random } from '@FMath/Random'
import { Vector } from '@FMath/Vector'
import { Body, ShapeType } from '@Physics/Body'
import { World } from '@Physics/World'
import createjs from 'createjs-module'

let canvas = document.createElement('canvas')
canvas.width = innerWidth
canvas.height = innerHeight

canvas.oncontextmenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
}

document.body.appendChild(canvas)

const TIME_STEP = new TimeStep()
const WORLD = new World()
const STAGE = new createjs.Stage(canvas)
const RANDOM = new Random()

STAGE.scaleX = 24
STAGE.scaleY = 24

STAGE.setBounds(0, 0, innerWidth / STAGE.scaleX, innerHeight / STAGE.scaleY)

TIME_STEP.on('start', init).on('step', (delta, time) => {
    update(delta, time)
    render()
})

let fills: string[] = []
let strokes: string[] = []
let shapes: createjs.Shape[] = []

let fps = new createjs.Text('fps: 0', 'bold .20vw sans-serif', 'white')

fps.x += .24
fps.y += .24

let lastFrameIndex = 0
let deltaTimes = Array<number>(50)

STAGE.addChild(fps)

function init() {
    let { x: left, y: top, width: right, height: bottom } = STAGE.getBounds()
    let padding = Math.abs(right - left) * .05

    let ground = Body.createRectangle(right - left - padding * 2, 3, new Vector((right - left) * .5, (bottom - top) * .9), 1, .5, true)

    WORLD.addBody(ground)
    fills.push('green')
    strokes.push('white')

    let shape = new createjs.Shape()

    shapes.push(shape)
    STAGE.addChild(shape)

    STAGE.on('stagemousedown', (event) => {
        let x = event['stageX' as keyof Object] as unknown as number / STAGE.scaleX
        let y = event['stageY' as keyof Object] as unknown as number / STAGE.scaleY
        
        let button = event['nativeEvent' as keyof Object]['button' as keyof Object] as unknown as number

        let body!: Body

        if (button == 0) {
            let width = RANDOM.float(2, 6)
            let height = RANDOM.float(2, 6)

            body = Body.createRectangle(width, height, new Vector(x, y), 2, .6, false)
        } else if (button == 2) {
            let radius = RANDOM.float(1, 3)

            body = Body.createCircle(radius, new Vector(x, y), 2, .6, false)
        }

        WORLD.addBody(body)
        fills.push('#' + RANDOM.int(0x0, 0xFFFFFF).toString(16))
        strokes.push('white')

        let shape = new createjs.Shape()

        shapes.push(shape)
        STAGE.addChild(shape)
    })
}
function update(delta: number, time: number): void {
    let { height: bottom } = STAGE.getBounds()

    for (let i = 0; i < WORLD.bodyCount; i++) {
        let body = WORLD.getBody(i)

        if (!body)
            continue

        let bounds = body.getBounds()

        if (bounds.min.y > bottom) {
            WORLD.deleteBody(body)
            fills.splice(i, 1)
            strokes.splice(i, 1)

            STAGE.removeChild(shapes[i])

            shapes.splice(i, 1)
        }
    }

    deltaTimes[lastFrameIndex] = delta
    lastFrameIndex = (lastFrameIndex + 1) % deltaTimes.length
    
    let total = 0

    for (let deltaTime of deltaTimes)
        total += deltaTime

    fps.set({ text: `fps: ${(deltaTimes.length / total).toFixed(0)}\nbodies: ${WORLD.bodyCount}` })

    WORLD.step(delta, 16)
}
function render(): void {
    for (let i = 0; i < WORLD.bodyCount; i++) {
        let body = WORLD.getBody(i)

        if (!body)
            continue

        if (body.type == ShapeType.Circle) {
            shapes[i].graphics.clear().setStrokeStyle(Math.min(STAGE.scaleX, STAGE.scaleY) * .0024)
            .beginStroke(strokes[i]).beginFill(fills[i]).drawCircle(body.position.x, body.position.y, body.radius).closePath().endStroke().endFill()
        } else if (body.type == ShapeType.Rectangle) {
            shapes[i].graphics.clear().setStrokeStyle(Math.min(STAGE.scaleX, STAGE.scaleY) * .0024)

            let [a, b, c, d] = body.getTransformedVertices()

            shapes[i].graphics.beginStroke(strokes[i]).beginFill(fills[i])
                .moveTo(a.x, a.y).lineTo(b.x, b.y).lineTo(c.x, c.y).lineTo(d.x, d.y)
                .closePath().endStroke().endFill()
        }
    }

    STAGE.update()
}

function wrap() {
    let { x: left, y: top, width: right, height: bottom } = STAGE.getBounds()

    for (let i = 0; i < WORLD.bodyCount; i ++) {
        let body = WORLD.getBody(i)

        if (!body)
            continue

        if (body.position.x < left) body.moveTo(new Vector(right, body.position.y))
        if (body.position.x > right) body.moveTo(new Vector(left, body.position.y))
        if (body.position.y < top) body.moveTo(new Vector(body.position.x, bottom))
        if (body.position.y > bottom) body.moveTo(new Vector(body.position.x, top))
    }
}

onload = () => TIME_STEP.start()

console.log('SEX!!!!!!!!!!!!!')

export {}