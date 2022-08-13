import { Body, Engine, Colliders, Random, Renderer, Vector, World, MathF, Shapes, AABB } from '.'

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

// let bodyA = Shapes.polygon({
//     position: new Vector(min.x + padding.x * 2, 1), radius: 3, sides: 5,
//     density: 2.5, restitution: 0.3
// })

// WORLD.addBody(bodyA)

// let bodyB = Shapes.polygon({
//     position: new Vector(max.x - padding.x * 4, -1), radius: 2, sides: 7,
//     density: 2.5, restitution: 0.3
// })

// bodyB.transform.rotation = Math.PI

// WORLD.addBody(bodyB)

// let bodyC = Shapes.polygon({
//     position: new Vector(max.x - padding.x * 2, -4), radius: 2, sides: 3,
//     density: 2.5, restitution: 0.3
// })

// bodyC.transform.rotation = -MathF.PI_OVER_TWO

// WORLD.addBody(bodyC)

for (let i = 0; i < 20; i++) {
    let x = Random.float(min.x + padding.x * 2, max.x - padding.x * 2)
    let y = Random.float(min.y + padding.y, 0)
    let radius = Random.float(2, 4)
    let sides = Random.integer(2, 5) * 2 - 1 

    let body = Shapes.polygon({
        position: new Vector(x, y), radius, sides,
        density: 2.5, restitution: 0.3
    })

    body.transform.rotation = Random.float(0, MathF.TWO_PI)

    WORLD.addBody(body)
}

let fps = 0

ENGINE.on('tick', (delta) => {
    let iterations = 4
    let timescale = 1

    for (let i = 0; i < iterations; i++)
        WORLD.step(delta / iterations * timescale)

    fps = MathF.average(...ENGINE.deltaHistory)

    RENDERER.update()
})
RENDERER.on('render', (graphics) => {
    let bodies = Reflect.get(WORLD, '_bodies') as Body[]

    for (let body of bodies) {
        let { transform, collider } = body

        graphics.drawCircleFill(transform.position.x, transform.position.y, .1, DefaultColors.Red)

        if (collider instanceof Colliders.CircleCollider) graphics.drawCircleLine(transform.position.x, transform.position.y, collider.radius, 2, DefaultColors.White)
        else if (collider instanceof Colliders.PolygonCollider) graphics.drawPolyLine(collider.getTransformedVertices(transform), 2, DefaultColors.White)
    }

    graphics.drawText(`Fps: ${Math.round(fps)}`, min.x + 1, min.y + 3, '50px sans-serif', DefaultColors.White)
})

onload = () => ENGINE.start()