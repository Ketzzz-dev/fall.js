import { Engine } from '@Core/Engine'
import { Renderer } from '@Core/Renderer'
import { Random } from '@Math/Random'
import { Vector } from '@Math/Vector'
import { Body } from '@Physics/Body'
import { CircleCollider, PolygonCollider } from '@Physics/Collisions/Colliders'
import { World } from '@Physics/World'

const ENGINE = new Engine
const RENDERER = new Renderer(innerWidth, innerHeight)
const WORLD = new World

document.body.appendChild(RENDERER.canvas)

let body = Body.rectangle({
    position: new Vector(-40, 0),
    width: 3, height: 3, density: 1.5, restitution: 0.6
})

WORLD.addBody(body)

for (let i = 0; i < 50; i++) {
    let x = Random.float(-30, 30)
    let y = Random.float(-20, 20)
    
    if (Random.boolean(0)) {
        let radius = Random.float(1, 3)

        WORLD.addBody(Body.circle({
            position: new Vector(x, y),
            radius, density: 1.5, restitution: 0.6
        }))
    } else {
        let width = Random.float(2, 6)
        let height = Random.float(2, 6)
        
        WORLD.addBody(Body.rectangle({
            position: new Vector(x, y),
            width, height, density: 1.5, restitution: 0.6
        }))
    }
}

ENGINE.on('tick', (delta) => {
    body.force = Vector.add(body.force, new Vector(50, 0))

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

export {}