import { Engine } from './core'
import { Renderer } from './core/Renderer'
import { FMath, Vector } from './math'
import { RigidBody } from './physics'
import { Material } from './physics/Material'
import { Shapes } from './physics/Shapes'
import { World } from './physics/World'
import { Color } from './util/Color'
import { Random } from './util/Random'

const ENGINE = new Engine({ tickRate: 120, renderer: { width: 0, height: 0 } })
const WORLD = new World
const RENDERER = new Renderer(innerWidth, innerHeight)

document.getElementById('main')?.append(RENDERER.canvas)

RENDERER.canvas.style.backgroundColor = Color.BLACK.toString()

let ground = Shapes.rectangle({
    position: new Vector(0, 0 + 30),
    material: Material.ROCK, width: innerWidth / 16 - 3, height: 3, isStatic: true,
    rendering: { fillColor: Color.GREEN, visible: true }
})

WORLD.addBody(ground)

for (let i = 0; i < 20; i++) {
    let x = Random.float(-30, 30)
    let y = Random.float(-30, -10)
    let orientation = Random.float(0, FMath.TWO_PI)
    let material = Material.WOOD
    let rendering = { fillColor: Color.RED, visible: true }

    let body: RigidBody

    if (Random.boolean()) {
        let radius = Random.float(1.2, 1.8)

        body = Shapes.circle({
            position: new Vector(x, y), orientation,
            material, radius, rendering
        })
    } else if (Random.boolean()) {
        let radius = Random.float(1.2, 1.8)
        let sides = Random.integer(3, 8)

        body = Shapes.polygon({
            position: new Vector(x, y), orientation,
            material, radius, sides, rendering
        })
    } else {
        let width = Random.float(1.8, 3.6)
        let height = Random.float(1.8, 3.6)

        body = Shapes.rectangle({
            position: new Vector(x, y), orientation,
            material, width, height, rendering
        })
    }

    WORLD.addBody(body)
}

let fps = 0

ENGINE.on('update', (delta) => {
    WORLD.update(delta)

    let total = 0

    for (let d of ENGINE.timestep.deltaHistory) total += d

    fps = ENGINE.timestep.deltaHistory.length / total
}).on('render', () => {
    RENDERER.render(WORLD)
})

export {}