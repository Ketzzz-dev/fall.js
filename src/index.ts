import { Renderer } from '@Display/Renderer'
import { TimeStep } from '@Core/TimeStep'
import { Random } from '@FMath/Random'
import { Vector } from '@FMath/Vector'
import { Body, ShapeType } from '@Physics/Body'
import { World } from '@Physics/World'

const TIME_STEP = new TimeStep()
const WORLD = new World()
const RENDERER = new Renderer(innerWidth, innerHeight)
const RANDOM = new Random()

const ITERATIONS = 16

document.body.appendChild(RENDERER.canvas)

let colours = Array<string>()

let { min, max } = RENDERER.camera.bounds

let padding = Vector.mul(Vector.sub(max, min), .1)

let ground = Body.createRectangle(
    (max.x - min.x) - padding.x, 3, new Vector(0, max.y - padding.y),
    1, .5, true
)

WORLD.addBody(ground)
colours.push('green')

RENDERER.canvas.onmousedown = ({ clientX, clientY, button }) => {
    let mousePosition = RENDERER.camera.screenToWorldPosition(
        new Vector(clientX, clientY)
    )

    let body!: Body

    if (button == 0) {
        let width = RANDOM.float(2, 6)
        let height = RANDOM.float(2, 6)

        body = Body.createRectangle(width, height, mousePosition, 2, .6, false)
    } else if (button == 2) {
        let radius = RANDOM.float(1, 3)

        body = Body.createCircle(radius, mousePosition, 2, .6, false)
    }

    WORLD.addBody(body)
    colours.push('#' + RANDOM.int(0x0, 0xFF).toString(16) + RANDOM.int(0x0, 0xFF).toString(16) + RANDOM.int(0x0, 0xFF).toString(16))
}

TIME_STEP.on('step', (delta, time) => {
    for (let i = 0; i < WORLD.bodyCount; i++) {
        let body = WORLD.getBody(i)

        if (!body)
            continue
        
        let bodyBounds = body.getBounds()

        if (bodyBounds.min.y > innerHeight) {
            WORLD.deleteBody(body)
            colours.splice(i, 1)
        }
    }

    WORLD.step(delta, ITERATIONS)
    RENDERER.update()
})

RENDERER.on('render', (graphics) => {
    for (let i = 0; i < WORLD.bodyCount; i++) {
        let body = WORLD.getBody(i)

        if (!body)
            continue

        switch (body.type) {
            case ShapeType.Circle:
                graphics.drawCircleFill(
                    body.position.x, body.position.y, body.radius,
                    colours[i]
                )
                graphics.drawCircleLine(
                    body.position.x, body.position.y, body.radius,
                    2, 'white'
                )

                break
            case ShapeType.Rectangle:
                graphics.drawPolyFill(
                    body.getTransformedVertices(), colours[i]
                )
                graphics.drawPolyLine(
                    body.getTransformedVertices(), 2, 'white'
                )
        }
    }
})

onload = () => TIME_STEP.start()

export {}