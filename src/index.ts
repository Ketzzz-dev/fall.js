import { Engine } from '@Core/Engine'
import { Renderer } from '@Core/Renderer'
import { Random } from '@Math/Random'
import { Vector } from '@Math/Vector'
import { Body } from '@Physics/Body'
import { CircleCollider } from '@Physics/Collisions/Colliders'
import { World } from '@Physics/World'

const ENGINE = new Engine
const RENDERER = new Renderer(innerWidth, innerHeight)
const WORLD = new World

document.body.appendChild(RENDERER.canvas)

let circle = Body.circle({
    position: new Vector(-60, 0),
    radius: 2, density: 1.5, restitution: 0.6
})

WORLD.addBody(circle)

for (let i = 0; i < 50; i++) {
    let x = Random.float(-60, 60)
    let y = Random.float(-20, 20)
    let radius = Random.float(1, 3)

    WORLD.addBody(Body.circle({
        position: new Vector(x, y),
        radius, density: 1.5, restitution: 0.6
    }))
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
        }
    }
})

onload = () => ENGINE.start()

export {}