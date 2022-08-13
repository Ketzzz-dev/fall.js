import { Engine } from './core/Engine'
import { Renderer } from './core/Renderer'
import { AABB } from './geometry/AABB'
import { Colliders } from './physics/collisions/Colliders'
import { RigidBody } from './physics/RigidBody'
import { Shapes } from './physics/Shapes'
import { Vector } from './physics/Vector'
import { World } from './physics/World'
import { FMath } from './utility/FMath'
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
    density: 3, restitution: 0.3, isStatic: true
})

WORLD.addBody(ground)

for (let i = 0; i < 20; i++) {
    let x = Random.float(min.x + padding.x * 2, max.x - padding.x * 2)
    let y = Random.float(min.y + padding.y, 0)
    let rotation = Random.float(0, FMath.TWO_PI)
    let radius = Random.float(2, 4)
    let sides = Random.integer(2, 5) * 2 - 1 

    let body: RigidBody

    if (Random.boolean(.75)) body = Shapes.polygon({
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

    fps = FMath.average(...ENGINE.deltaHistory)

    RENDERER.update()
})
RENDERER.on('render', (graphics) => {
    let bodies = Reflect.get(WORLD, '_bodies') as RigidBody[]

    for (let body of bodies) {
        let { transform, collider } = body

        if (!AABB.overlaps(collider.getBounds(transform), RENDERER.camera.bounds))
            continue

        graphics.drawCircleFill(transform.position.x, transform.position.y, .1, DefaultColors.Red)

        if (collider instanceof Colliders.CircleCollider) graphics.drawCircleLine(transform.position.x, transform.position.y, collider.radius, 2, DefaultColors.White)
        else if (collider instanceof Colliders.PolygonCollider) graphics.drawPolyLine(collider.getTransformedVertices(transform), 2, DefaultColors.White)
    }

    graphics.drawText(`Fps: ${Math.round(fps)}`, min.x + 1, min.y + 3, '50px sans-serif', DefaultColors.White)
})

onload = () => ENGINE.start()

// core modules
export * from './core/Engine'
export * from './core/Renderer'

// display modules
export * from './display/Camera'
export * from './display/Graphics'

// geometry modules
export * from './geometry/AABB'

// physics modules
export * from './physics/RigidBody'
export * from './physics/Shapes'
export * from './physics/Transform'
export * from './physics/Vector'
export * from './physics/World'

export * from './physics/collisions/Colliders'
export * from './physics/collisions/CollisionManifold'

// utility modules
export * from './utility/FMath'
export * from './utility/Pair'
export * from './utility/Random'