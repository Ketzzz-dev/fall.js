import { AABB } from './geometry/AABB'
import { CircleCollider, PolygonCollider } from './physics/Colliders'
import { RigidBody } from './physics/RigidBody'
import { Shapes } from './physics/Shapes'
import { Vector } from './physics/Vector'
import { FMath } from './utility/FMath'
import { Random } from './utility/Random'
import { Engine } from './core/Engine'

const ENGINE = new Engine({
    tickRate: 50,
    renderer: {
        width: innerWidth,
        height: innerHeight
    }
})

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

document.body.appendChild(ENGINE.renderer.canvas)

let { min, max } = ENGINE.renderer.camera.bounds
let padding = Vector.multiply(.1, Vector.subtract(max, min))

let ground = Shapes.rectangle({
    position: new Vector(0, max.y - padding.y), width: (max.x - min.x) - padding.x, height: 3,
    density: 3, restitution: 0.2, isStatic: true
})

ENGINE.world.addBody(ground)

let platformA = Shapes.rectangle({
    position: new Vector(min.x + padding.x * 3, min.y + padding.y * 5.5), rotation: .175 * FMath.PI_OVER_TWO,
    width: .37 * ((max.x - min.x) - padding.x), height: 2,
    density: 3, restitution: 0.2, isStatic: true
})

ENGINE.world.addBody(platformA)

let platformB = Shapes.rectangle({
    position: new Vector(max.x - padding.x * 3, min.y + padding.y * 4), rotation: -.175 * FMath.PI_OVER_TWO,
    width: .37 * ((max.x - min.x) - padding.x), height: 2,
    density: 3, restitution: 0.2, isStatic: true
})

ENGINE.world.addBody(platformB)

for (let i = 0; i < 20; i++) {
    let x = Random.float(min.x + padding.x * 2, max.x - padding.x * 2)
    let y = Random.float(min.y + padding.y, 0)
    let rotation = Random.float(0, FMath.TWO_PI)
    let radius = Random.float(1.2, 1.7)
    let sides = Random.integer(2, 5) * 2 - 1 

    let body: RigidBody

    if (Random.boolean(1)) body = Shapes.polygon({
        position: new Vector(x, y), rotation, radius, sides,
        density: 2.5, restitution: 0.3
    })
    else body = Shapes.circle({
        position: new Vector(x, y), rotation, radius,
        density: 2.5, restitution: 0
    })

    ENGINE.world.addBody(body)
}

ENGINE.renderer.on('render', (graphics) => {
    let bodies = Reflect.get(ENGINE.world, '_bodies') as RigidBody[]

    for (let body of bodies) {
        let { transform, collider } = body

        let bounds = collider.getBounds(transform)

        if (!AABB.overlaps(bounds, ENGINE.renderer.camera.bounds))
            continue

        if (collider instanceof CircleCollider) graphics.drawCircleLine(transform.position.x, transform.position.y, collider.radius, 1, DefaultColors.White)
        else if (collider instanceof PolygonCollider) graphics.drawPolyLine(collider.getTransformedVertices(transform), 1, DefaultColors.White)

        let d = FMath.rotate(Vector.add(transform.position, Vector.RIGHT), transform.rotation, transform.position)

        graphics.drawLine(transform.position.x, transform.position.y, d.x, d.y, 1, DefaultColors.Green)
    }
})

console.log('WILL ALL FEMALES PLEASE MOVE TO #MEMES, WE ARE PLAYING BTD6!!!')