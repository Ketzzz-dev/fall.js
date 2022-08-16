import { Engine } from './core/Engine'
import { Renderer } from './core/Renderer'
import { AABB } from './geometry/AABB'
import { CircleCollider, PolygonCollider } from './physics/Colliders'
import { RigidBody } from './physics/RigidBody'
import { Shapes } from './physics/Shapes'
import { Vector } from './physics/Vector'
import { World } from './physics/World'
import { MathF } from './utility/MathF'
import { Random } from './utility/Random'

const ENGINE = new Engine
const RENDERER = new Renderer(innerWidth, innerHeight)
const WORLD = new World

enum DefaultColors {
    Black = '#5C6370',
    Red = '#E06C75',
    Green = '#98C379',
    Yellow = '#E5C07B',
    Blue = '#61AFEF',
    Purple = '#C678DD',
    Cyan = '#56B6C2',
    White = '#DCDFE4'
}

document.body.appendChild(RENDERER.canvas)

let { min, max } = RENDERER.camera.bounds
let padding = Vector.multiply(.1, Vector.subtract(max, min))

let ground = Shapes.rectangle({
    position: new Vector(0, max.y - padding.y), width: (max.x - min.x) - padding.x, height: 3,
    density: 3, restitution: 0.2, isStatic: true
})

WORLD.addBody(ground)

let platformA = Shapes.rectangle({
    position: new Vector(min.x + padding.x * 3, min.y + padding.y * 5.5), rotation: .175 * MathF.PI_OVER_TWO,
    width: .37 * ((max.x - min.x) - padding.x), height: 2,
    density: 3, restitution: 0.2, isStatic: true
})

WORLD.addBody(platformA)

let platformB = Shapes.rectangle({
    position: new Vector(max.x - padding.x * 3, min.y + padding.y * 4), rotation: -.175 * MathF.PI_OVER_TWO,
    width: .37 * ((max.x - min.x) - padding.x), height: 2,
    density: 3, restitution: 0.2, isStatic: true
})

WORLD.addBody(platformB)

for (let i = 0; i < 20; i++) {
    let { min, max } = platformB.collider.getBounds(platformB.transform)

    let x = Random.float(min.x + padding.x, max.x)
    let y = Random.float(min.y, max.y) - 20
    let rotation = Random.float(0, MathF.TWO_PI)
    let radius = Random.float(1, 1.7)
    let sides = Random.integer(2, 5) * 2 - 1 

    let body: RigidBody

    if (Random.boolean()) body = Shapes.polygon({
        position: new Vector(x, y), rotation, radius, sides,
        density: 2.5, restitution: 0.3
    })
    else body = Shapes.circle({
        position: new Vector(x, y), rotation, radius,
        density: 2.5, restitution: 0.3
    })

    WORLD.addBody(body)
}

let fps = 0

ENGINE.on('tick', (delta) => {
    let iterations = 4
    let timescale = 1

    for (let i = 0; i < iterations; i++)
        WORLD.step(delta / iterations * timescale)

    let total = 0

    for (let dt of ENGINE.deltaHistory) total += dt

    fps = ENGINE.deltaHistory.length / total
    
    RENDERER.update()
})
RENDERER.on('render', (graphics) => {
    let bodies = Reflect.get(WORLD, '_bodies') as RigidBody[]

    for (let body of bodies) {
        let { transform, collider } = body

        let bounds = collider.getBounds(transform)

        if (!AABB.overlaps(bounds, RENDERER.camera.bounds))
            continue

        if (collider instanceof CircleCollider) graphics.drawCircleLine(transform.position.x, transform.position.y, collider.radius, 2, DefaultColors.White)
        else if (collider instanceof PolygonCollider) graphics.drawPolyLine(collider.getTransformedVertices(transform), 2, DefaultColors.White)
        
        graphics.drawCircleFill(transform.position.x, transform.position.y, .1, DefaultColors.Red)

        let d = MathF.rotate(Vector.add(transform.position, Vector.RIGHT), transform.rotation, transform.position)

        graphics.drawLine(transform.position.x, transform.position.y, d.x, d.y, 2, DefaultColors.Red)
    }

    graphics.drawText(`Fps: ${Math.round(fps)}`, min.x + 1, min.y + 3, '50px sans-serif', DefaultColors.White)
})

onload = () => ENGINE.start()