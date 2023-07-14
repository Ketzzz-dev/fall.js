import { Vector2 } from '../Math/Vector2'

export class BoundingBox {
	public constructor(
		public readonly min: Vector2,
		public readonly max: Vector2
	) {
	}

	public static intersects(a: BoundingBox, b: BoundingBox): boolean {
		if (a.max.x < b.min.x || a.min.x > b.max.x) return false
		if (a.max.y < b.min.y || a.min.y > b.max.y) return false

		return true
	}
}