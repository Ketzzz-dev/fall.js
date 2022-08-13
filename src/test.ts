import { RigidBody, Engine, Colliders, Random, Renderer, Vector, World, MathF, Shapes, AABB } from '.'

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
    let rotation = Random.float(0, MathF.TWO_PI)
    let radius = Random.float(2, 4)
    let sides = Random.integer(2, 5) * 2 - 1 

    let body = Shapes.polygon({
        position: new Vector(x, y), rotation, radius, sides,
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

    fps = MathF.average(...ENGINE.deltaHistory)

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