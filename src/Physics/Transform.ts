import { Vector2 } from '../Math/Vector2'

export class Transform {
	public constructor(
		public position = Vector2.ZERO,
		public rotation = 0
	) {
	}
}