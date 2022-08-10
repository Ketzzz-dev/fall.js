import { Body, Engine, Colliders, Random, Renderer, Vector, World, MathF } from '.'
import { AABB } from './geometry/AABB'
import { Shapes } from './physics/Shapes'

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

let colors = Array<DefaultColors>()

let { min, max } = RENDERER.camera.bounds
let padding = Vector.multiply(.1, Vector.subtract(max, min))

let ground = Shapes.rectangle({
    position: new Vector(0, max.y - padding.y),
    width: (max.x - min.x) - padding.x, height: 3,
    density: 2.65, restitution: 0.3, isStatic: true
})

WORLD.addBody(ground)
colors.push(DefaultColors.Green)

for (let i = 0; i < 30; i++) {
    let x = Random.float(min.x + padding.x, max.x - padding.x)
    let y = Random.float(min.y + padding.y, 0)

    let body: Body
    
    if (Random.boolean()) {
        let radius = Random.float(1, 3)

        body = Shapes.circle({
            position: new Vector(x, y), 
            radius, density: 1.5, restitution: 1 / 6
        })
    } else if (Random.boolean()) {
        let radius = Random.float(2, 3)
        let sides = Random.integer(2, 5) * 2

        body = Shapes.polygon({
            position: new Vector(x, y), 
            radius, sides, density: 1.5, restitution: 1 / 6
        })
    } else {
        let width = Random.float(2, 6)
        let height = Random.float(2, 6)
        
        body = Shapes.rectangle({
            position: new Vector(x, y), 
            width, height, density: 1.5, restitution: 1 / 6
        })
    }

    body.transform.rotation = Random.float(0, MathF.TWO_PI)

    WORLD.addBody(body)
    colors.push(Random.fromArray(Object.values(DefaultColors)))
}

let fps = 0

ENGINE.on('tick', (delta) => {
    let iterations = 16

    for (let i = 0; i < iterations; i++)
        WORLD.step(delta / iterations)

    let total = ENGINE.deltaHistory.reduce((t, dt) => t + dt)

    fps = ENGINE.deltaHistory.length / total

    RENDERER.update()
})
RENDERER.on('render', (graphics) => {
    let bodies = Reflect.get(WORLD, '_bodies') as Body[]

    for (let body of bodies) {
        if (!AABB.overlaps(body.collider.getBounds(body.transform), RENDERER.camera.bounds))
            continue

        let color = colors[bodies.indexOf(body)]

        if (body.collider instanceof Colliders.CircleCollider) {
            let { transform, collider } = body

            // graphics.drawCircleLine(transform.position.x, transform.position.y, collider.radius, 2, body.isStatic ? DefaultColors.Black : DefaultColors.White)
            graphics.drawCircleFill(transform.position.x, transform.position.y, collider.radius, color)
        } else if (body.collider instanceof Colliders.PolygonCollider) {
            let { transform, collider } = body

            // graphics.drawPolyLine(collider.getTransformedVertices(transform), 2, body.isStatic ? DefaultColors.Black : DefaultColors.White)
            graphics.drawPolyFill(collider.getTransformedVertices(transform), color)
        }
    }

    graphics.drawText(`Fps: ${Math.round(fps)}`, min.x + 1, min.y + 3, '50px sans-serif', DefaultColors.White)
})

onload = () => ENGINE.start()