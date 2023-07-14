export class Material {
	public static DEFAULT = new Material(1.4, .5, .6, .3)
	public constructor(
		public readonly density: number,
		public readonly restitution: number,
		public readonly staticFriction: number,
		public readonly dynamicFriction: number
	) {
	}
}