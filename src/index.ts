import { Engine,} from './core'
import { Vector } from './math'
import { Shapes, Material } from './physics'
import { Color } from './util'

const ENGINE = new Engine({ iterations: 100, renderer: { width: innerWidth, height: innerHeight } })

document.getElementById('main')?.append(ENGINE.renderer.canvas)

ENGINE.renderer.canvas.style.backgroundColor = Color.BLACK.toString()

let { min, max } = ENGINE.renderer.camera.bounds
let padding = Vector.multiply(.1, Vector.subtract(max, min))

let ground = Shapes.rectangle({
    position: new Vector(0, max.y - padding.y),
    material: Material.DEFAULT, width: max.x - min.x - padding.x, height: 3, isStatic: true,
    rendering: { fillColor: Color.GREEN }
})

ENGINE.world.addBody(ground)

let start = new Vector(0, max.y - padding.y * 1.5)
let step = new Vector(0, 4)
let size = new Vector(1, 6)

for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
        let position = Vector.add(new Vector(x * step.x, -y * step.y), start)

        let body = Shapes.polygon({
            position, radius: 1.5, sides: 6, material: Material.DEFAULT
        })


        ENGINE.world.addBody(body)
    }
}

console.dir(ENGINE)

export {}