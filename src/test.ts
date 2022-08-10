import { Engine } from './core/Engine'
import { Renderer } from './core/Renderer'
import { Body } from './physics/Body'
import { CircleCollider, PolygonCollider } from './physics/collisions/Colliders'
import { Vector } from './physics/Vector'
import { World } from './physics/World'
import { Random } from './utility/Random'

const ENGINE = new Engine
const RENDERER = new Renderer(innerWidth, innerHeight)
const WORLD = new World

document.body.appendChild(RENDERER.canvas)

for (let i = 0; i < 50; i++) {
    let x = Random.float(-30, 30)
    let y = Random.float(-20, 20)

    let body: Body
    
    if (Random.boolean()) {
        let radius = Random.float(1, 3)
        let sides = Random.integer(3, 8)

        body = Body.polygon({
            position: new Vector(x, y),
            radius, sides, density: 1.5, restitution: 0.6
        })
    } else {
        let width = Random.float(2, 6)
        let height = Random.float(2, 6)
        
        body = Body.rectangle({
            position: new Vector(x, y),
            width, height, density: 1.5, restitution: 0.6
        })
    }

    body.transform.rotation = Random.float(0, Math.PI * 2)

    WORLD.addBody(body)
}

ENGINE.on('tick', (delta) => {
    WORLD.step(delta)

    RENDERER.update()
})
RENDERER.on('render', (graphics) => {
    for (let body of Reflect.get(WORLD, '_bodies') as Body[]) {
        if (body.collider instanceof CircleCollider) {
            let { transform, collider } = body

            graphics.drawCircleLine(transform.position.x, transform.position.y, collider.radius, 1, '#DCDFE4')
        } else if (body.collider instanceof PolygonCollider) {
            let { transform, collider } = body

            graphics.drawPolyLine(collider.getTransformedVertices(transform), 1, '#DCDFE4')
        }
    }
})

onload = () => ENGINE.start()