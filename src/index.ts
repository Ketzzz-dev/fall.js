import { Engine } from './Core/Engine'
import { Body } from './Physics/Body'
import { Collider } from './Physics/Collider'
import { Material } from './Physics/Material'
import { Transform } from './Physics/Transform'
import { World } from './Physics/World'
import { Vector2 } from './Math/Vector2'

import Polygon = Collider.Polygon
import Circle = Collider.Circle
import Capsule = Collider.Capsule

const PIXELS_PER_METER = 32

const engine = new Engine()
const world = new World()

const canvas = document.createElement('canvas')

document.getElementById('main')?.append(canvas)

canvas.width = 800
canvas.height = 600

canvas.style.backgroundColor = '#09080d'

const context = canvas.getContext('2d')!

context.lineJoin = 'round'
context.lineWidth = 2 / PIXELS_PER_METER

const ground = new Body(new Transform(new Vector2(0, 8)), Polygon.rectangle(23, 1), Material.DEFAULT, true)

world.addBodies(ground)

for (let i = 0; i < 1; i++) {
	const body = new Body(new Transform(new Vector2(Math.random() * 10 - 5, Math.random() * -5), Math.random() * Math.PI * 2), Polygon.regular(1, 5), Material.DEFAULT)

	console.log(body.mass, body.inertia)

	world.addBodies(body)
}

engine.on('update', (deltaTime) => {
	world.update(deltaTime)
}).on('render', () => {
	context.globalCompositeOperation = 'source-in'
	context.fillStyle = 'transparent'

	context.fillRect(0, 0, canvas.width, canvas.height)

	context.globalCompositeOperation = 'source-over'

	context.save()
	context.translate(.5 * canvas.width, .5 * canvas.height)
	context.scale(PIXELS_PER_METER, PIXELS_PER_METER)

	context.strokeStyle = 'white'
	context.fillStyle = 'white'

	for (const body of world.getBodies()) {

		context.beginPath()

		if (body.collider instanceof Circle) {
			context.arc(body.transform.position.x, body.transform.position.y, body.collider.radius, 0, Math.PI * 2)
			context.moveTo(body.transform.position.x, body.transform.position.y)

			const end = Vector2.transform(Vector2.multiply(Vector2.RIGHT, body.collider.radius), body.transform)

			context.lineTo(end.x, end.y)
		} else if (body.collider instanceof Polygon) {
			const vertices = body.collider.getTransformedVertices(body.transform)

			context.moveTo(vertices[0].x, vertices[0].y)

			for (let vertex of vertices) {
				context.lineTo(vertex.x, vertex.y)
			}
		} else if (body.collider instanceof Capsule) {
			const [start, end] = body.collider.getTransformedEdge(body.transform)

			context.arc(start.x, start.y, body.collider.radius, body.transform.rotation, body.transform.rotation + Math.PI)
			context.arc(end.x, end.y, body.collider.radius, body.transform.rotation + Math.PI, body.transform.rotation)
		}

		context.closePath()
		context.stroke()
	}

	context.restore()
}).run()
