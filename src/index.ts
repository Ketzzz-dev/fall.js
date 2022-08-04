import { Renderer } from '@Core/Renderer'
import { TimeStep } from '@Core/TimeStep'
import { Random } from '@FMath/Random'
import { Vector } from '@FMath/Vector'
import { Body, ShapeType } from '@Physics/Body'
import { World } from '@Physics/World'
import { Keyboard } from '@Input/Keyboard'
import { Button, Mouse } from '@Input/Mouse'

const TIME_STEP = new TimeStep()
const WORLD = new World()
const RENDERER = new Renderer(innerWidth, 700)
const RANDOM = new Random()
const KEYBOARD = new Keyboard(RENDERER)
const MOUSE = new Mouse(RENDERER)

const ITERATIONS = 18

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

TIME_STEP.on('tick', (delta) => {
    if (MOUSE.isButtonDown(Button.Left)) {
        let mousePosition = RENDERER.camera.screenToWorldPosition(MOUSE.position)

        let width = RANDOM.float(2, 6)
        let height = RANDOM.float(2, 6)

        let body = Body.createRectangle(width, height, mousePosition, 2, .6, false)

        WORLD.addBody(body)
        colours.push('#' + RANDOM.int(0x0, 0xFF).toString(16) + RANDOM.int(0x0, 0xFF).toString(16) + RANDOM.int(0x0, 0xFF).toString(16))
    } else if (MOUSE.isButtonDown(Button.Right)) {
        let mousePosition = RENDERER.camera.screenToWorldPosition(MOUSE.position)

        let radius = RANDOM.float(1, 3)

        let body = Body.createCircle(radius, mousePosition, 2, .6, false)

        WORLD.addBody(body)
        colours.push('#' + RANDOM.int(0x0, 0xFF).toString(16) + RANDOM.int(0x0, 0xFF).toString(16) + RANDOM.int(0x0, 0xFF).toString(16))

    }

    for (let i = 0; i < WORLD.bodyCount; i++) {
        let body = WORLD.getBody(i)

        if (!body)
            continue
        
        let bodyBounds = body.getBounds()
        let cameraBounds = RENDERER.camera.bounds

        if (bodyBounds.min.y > cameraBounds.max.y) {
            body.moveTo(
                new Vector(0, min.y)
            )
        }
    }
    
    WORLD.step(delta, ITERATIONS)
    KEYBOARD.update()
    MOUSE.update()
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
                    1, 'white'
                )

                break
            case ShapeType.Rectangle:
                graphics.drawPolyFill(
                    body.getTransformedVertices(), colours[i]
                )
                graphics.drawPolyLine(
                    body.getTransformedVertices(), 1, 'white'
                )
        }
    }

    let { camera } = RENDERER
    let { min, max } = camera.bounds
 
    graphics.drawText('hello', min.x + 1, min.y + 3, '50px bold', 'white')

})

addEventListener('load', () => TIME_STEP.start())

export {}