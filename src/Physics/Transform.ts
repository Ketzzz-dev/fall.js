import { Vector2 } from '../Math/Vector2'

export class Transform {

	// might add scale, idk
	public constructor(
		public position = Vector2.ZERO,
		public rotation = 0
	) {
	}
}