import { Vector2 } from '../Math/Vector2'
import { BoundingBox } from './BoundingBox'
import { Transform } from './Transform'

export abstract class Collider {
	protected constructor(public readonly area: number) {
	}

	public abstract getBoundingBox(parentTransform: Transform): BoundingBox
}

export namespace Collider {
	export class Circle extends Collider {
		public constructor(public readonly radius: number) {
			super(Math.PI * radius * radius)
		}

		public getBoundingBox(parentTransform: Transform): BoundingBox {
			return new BoundingBox(
				new Vector2(parentTransform.position.x - this.radius, parentTransform.position.y - this.radius),
				new Vector2(parentTransform.position.x + this.radius, parentTransform.position.y + this.radius)
			)
		}
	}

	export class Capsule extends Collider {
		private readonly start: Vector2
		private readonly end: Vector2

		public constructor(public readonly radius: number, public readonly length: number) {
			super(radius * (Math.PI * radius + 2 * length))

			const halfLength = length / 2

			this.start = new Vector2(0, halfLength)
			this.end = new Vector2(0, -halfLength)
		}

		public getTransformedEdge(parentTransform: Transform): [start: Vector2, end: Vector2] {
			return [
				Vector2.transform(parentTransform, this.start),
				Vector2.transform(parentTransform, this.end)
			]
		}
		public getBoundingBox(parentTransform: Transform): BoundingBox {
			const [start, end] = this.getTransformedEdge(parentTransform)

			const minX = Math.min(start.x, end.x)
			const minY = Math.min(start.y, end.y)
			const maxX = Math.max(start.x, end.x)
			const maxY = Math.max(start.y, end.y)

			return new BoundingBox(
				new Vector2(minX - this.radius, minY - this.radius),
				new Vector2(maxX + this.radius, maxY + this.radius)
			)
		}
	}

	export class Polygon extends Collider {
		public constructor(public readonly vertices: readonly Vector2[]) {
			if (vertices.length < 3)
				throw new Error('Cannot create a polygon with less than 3 vertices')

			let area = 0

			for (let i = 0; i < vertices.length; i++) {
				const currentVertex = vertices[i]
				const nextVertex = vertices[(i + 1) % vertices.length]

				area += Vector2.cross(currentVertex, nextVertex)
			}

			super(Math.abs(area / 2))
		}

		public static regular(radius: number, sides: number): Polygon {
			const vertices = [] as Vector2[]
			const theta = (2 * Math.PI) / sides

			for (let i = 0; i < sides; i++) {
				const angle = theta * i
				const x = radius * Math.cos(angle)
				const y = radius * Math.sin(angle)

				vertices.push(new Vector2(x, y))
			}

			return new Polygon(vertices)
		}

		public static rectangle(width: number, height: number): Polygon {
			const left = -width / 2
			const right = left + width
			const top = -height / 2
			const bottom = top + height

			const vertices = [
				new Vector2(left, top),
				new Vector2(right, top),
				new Vector2(right, bottom),
				new Vector2(left, bottom)
			]

			return new Polygon(vertices)
		}

		public getTransformedVertices(parentTransform: Transform): Vector2[] {
			const transformedVertices = [] as Vector2[]

			for (const vertex of this.vertices) {
				transformedVertices.push(Vector2.transform(parentTransform, vertex))
			}

			return transformedVertices
		}

		public getBoundingBox(parentTransform: Transform): BoundingBox {
			const transformedVertices = this.getTransformedVertices(parentTransform)

			let minX = transformedVertices[0].x
			let minY = transformedVertices[0].y
			let maxX = transformedVertices[0].x
			let maxY = transformedVertices[0].y

			for (const vertex of transformedVertices) {
				minX = Math.min(minX, vertex.x)
				minY = Math.min(minY, vertex.y)
				maxX = Math.max(maxX, vertex.x)
				maxY = Math.max(maxY, vertex.y)
			}

			return new BoundingBox(new Vector2(minX, minY), new Vector2(maxX, maxY))
		}
	}
}