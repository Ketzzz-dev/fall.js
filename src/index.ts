import { Renderer } from '@Display/Renderer'
import { TimeStep } from '@Core/TimeStep'
import { Random } from '@FMath/Random'
import { Vector } from '@FMath/Vector'
import { Body, ShapeType } from '@Physics/Body'
import { World } from '@Physics/World'

const TIME_STEP = new TimeStep()
const WORLD = new World()
const RENDERER = new Renderer(innerWidth, 700)
const RANDOM = new Random()

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

// let topWall = Body.createRectangle(
//     max.x - min.x, .1, new Vector(0, min.y),
//     1, .4, true
// )
// let bottomWall = Body.createRectangle(
//     max.x - min.x, .1, new Vector(0, max.y),
//     1, .4, true
// )
// let leftWall = Body.createRectangle(
//     .1, max.y - min.y, new Vector(min.x, 0),
//     1, .4, true
// )
// let rightWall = Body.createRectangle(
//     .1, max.y - min.y, new Vector(max.x, 0),
//     1, .4, true
// )

// WORLD.addBody(topWall)
// colours.push('white')
// WORLD.addBody(bottomWall)
// colours.push('white')
// WORLD.addBody(leftWall)
// colours.push('white')
// WORLD.addBody(rightWall)
// colours.push('white')

// RENDERER.camera.move(new Vector(0, -160))

RENDERER.canvas.onmousedown = ({ clientX, clientY, button }) => {
    let mousePosition = RENDERER.camera.screenToWorldPosition(
        new Vector(clientX, clientY)
    )

    let body: Body | void

    if (button == 0) {
        let width = RANDOM.float(2, 6)
        let height = RANDOM.float(2, 6)

        body = Body.createRectangle(width, height, mousePosition, 2, .6, false)
    } else if (button == 2) {
        let radius = RANDOM.float(1, 3)

        body = Body.createCircle(radius, mousePosition, 2, .6, false)
    }

    if (!body)
        return

    WORLD.addBody(body)
    colours.push('#' + RANDOM.int(0x0, 0xFF).toString(16) + RANDOM.int(0x0, 0xFF).toString(16) + RANDOM.int(0x0, 0xFF).toString(16))
}

console.log(TIME_STEP)

TIME_STEP.on('tick', (delta) => {
    for (let i = 0; i < WORLD.bodyCount; i++) {
        let body = WORLD.getBody(i)

        if (!body)
            continue
        
        let bodyBounds = body.getBounds()
        let cameraBounds = RENDERER.camera.bounds

        if (bodyBounds.min.y > cameraBounds.max.y) {
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
})

addEventListener('load', () => TIME_STEP.start())

export {}