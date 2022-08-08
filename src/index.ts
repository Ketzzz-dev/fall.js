import { Renderer } from '@Core/Renderer'
import { TimeStep } from '@Core/TimeStep'
import { Random } from '@FMath/Random'
import { Vector } from '@FMath/Vector'
import { Body, ShapeType } from '@Physics/Body'
import { World } from '@Physics/World'
import { Keyboard } from '@Input/Keyboard'
import { Button, Mouse } from '@Input/Mouse'
import { intersectAABBs } from '@Physics/Collisions'

const TIME_STEP = new TimeStep()
const WORLD = new World()
const RENDERER = new Renderer(innerWidth, 700)
const RANDOM = new Random()
const KEYBOARD = new Keyboard(RENDERER)
const MOUSE = new Mouse(RENDERER)

const ITERATIONS = 18

const DEFAULT_COLOURS = {
    red: '#E06C75',
    green: '#98C379',
    yellow: '#E5C07B',
    blue: '#61AFEF',
    purple: '#C678DD',
    cyan: '#56B6C2',
    white: '#DCDFE4'
}

document.body.appendChild(RENDERER.canvas)

let colours = Array<string>()

let { min, max } = RENDERER.camera.bounds

let padding = Vector.mul(Vector.sub(max, min), .1)

let ground = Body.createRectangle(
    (max.x - min.x) - padding.x, 3, new Vector(0, max.y - padding.y),
    1, .5, true
)

let fps = 0

WORLD.addBody(ground)
colours.push('#98C379')

TIME_STEP.on('tick', (delta) => {
    if (MOUSE.isButtonDown(Button.Left)) {
        let mousePosition = RENDERER.camera.screenToWorldPosition(MOUSE.position)

        let width = RANDOM.float(2, 6)
        let height = RANDOM.float(2, 6)

        let body = Body.createRectangle(width, height, mousePosition, 2, .6, false)

        WORLD.addBody(body)
        
        let keys = Object.keys(DEFAULT_COLOURS) as (keyof typeof DEFAULT_COLOURS)[]

        colours.push(DEFAULT_COLOURS[keys[RANDOM.int(0, keys.length)]])
    } else if (MOUSE.isButtonDown(Button.Right)) {
        let mousePosition = RENDERER.camera.screenToWorldPosition(MOUSE.position)

        let radius = RANDOM.float(1, 3)

        let body = Body.createCircle(radius, mousePosition, 2, .6, false)

        WORLD.addBody(body)

        let keys = Object.keys(DEFAULT_COLOURS) as (keyof typeof DEFAULT_COLOURS)[]

        colours.push(DEFAULT_COLOURS[keys[RANDOM.int(0, keys.length - 1)]])
    }

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

    let history = Reflect.get(TIME_STEP, 'deltaHistory') as number[]
    let total = 0

    for (let deltaTime of history)
        total += deltaTime

    fps = history.length / total

    KEYBOARD.update()
    MOUSE.update()
    RENDERER.update()
})

RENDERER.on('render', (graphics) => {
    for (let i = 0; i < WORLD.bodyCount; i++) {
        let body = WORLD.getBody(i)

        if (!body)
            continue
        if (!intersectAABBs(body.getBounds(), RENDERER.camera.bounds))
            continue

        switch (body.type) {
            case ShapeType.Circle:
                graphics.drawCircleFill(
                    body.position.x, body.position.y, body.radius,
                    colours[i]
                )
                graphics.drawCircleLine(
                    body.position.x, body.position.y, body.radius,
                    1, DEFAULT_COLOURS.white
                )

                break
            case ShapeType.Rectangle:
                graphics.drawPolyFill(
                    body.getTransformedVertices(), colours[i]
                )
                graphics.drawPolyLine(
                    body.getTransformedVertices(), 1, DEFAULT_COLOURS.white
                )
        }
    }

    let { min } = RENDERER.camera.bounds

    graphics.drawText(`FPS: ${Math.round(fps).toString()}`, min.x + 1, min.y + 2, 'bold 25px sans-serif', DEFAULT_COLOURS.white)
    graphics.drawText(`Bodies: ${WORLD.bodyCount}`, min.x + 1, min.y + 4, 'bold 25px sans-serif', DEFAULT_COLOURS.white)
})

addEventListener('load', () => TIME_STEP.start())

export * from '@Core/Renderer'
export * from '@Core/TimeStep'
export * from '@Display/Camera'
export * from '@Display/Graphics'
export * from '@FMath/Common'
export * from '@FMath/Random'
export * from '@FMath/Vector'
export * from '@Geometry/AABB'
export * from '@Input/Keyboard'
export * from '@Input/Mouse'
export * from '@Physics/Body'
export * from '@Physics/CollisionManifold'
export * from '@Physics/Collisions'
export * from '@Physics/Transform'
export * from '@Physics/World'