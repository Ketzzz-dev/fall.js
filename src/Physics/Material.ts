export class Material {
	// might add more example materials
	public static DEFAULT = new Material(1.4, .5, .4, .2)

	// really need to clamp these values just in case
	public constructor(
		public readonly density: number,
		public readonly restitution: number,
		public readonly staticFriction: number,
		public readonly dynamicFriction: number
	) {
	}
}