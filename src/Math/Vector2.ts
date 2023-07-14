import { Common } from './Common'
import { Transform } from '../Physics/Transform'
import fuzzyEquals = Common.fuzzyEquals

export class Vector2 {
	public static readonly ZERO = new Vector2(0, 0)
	public static readonly ONE = new Vector2(1, 1)
	public static readonly UP = new Vector2(0, -1)
	public static readonly RIGHT = new Vector2(1, 0)
	public static readonly DOWN = new Vector2(0, 1)
	public static readonly LEFT = new Vector2(-1, 0)

	public constructor(
		public readonly x: number,
		public readonly y: number
	) {}

	public static add(...vn: Vector2[]): Vector2 {
		let sumX = 0
		let sumY = 0

		for (const v of vn) {
			sumX += v.x
			sumY += v.y
		}

		return new Vector2(sumX, sumY)
	}
	public static subtract(v1: Vector2, v2: Vector2): Vector2 {
		return new Vector2(v1.x - v2.x, v1.y - v2.y)
	}
	public static multiply(v: Vector2, scalar: number): Vector2 {
		return new Vector2(v.x * scalar, v.y * scalar)
	}
	public static divide(v: Vector2, scalar: number): Vector2 {
		if (scalar == 0)
			throw new Error('Cannot divide by 0')

		return new Vector2(v.x / scalar, v.y / scalar)
	}

	public static equals(a: Vector2, b: Vector2): boolean {
		return a.x == b.x && a.y == b.y
	}
	public static fuzzyEquals(a: Vector2, b: Vector2): boolean {
		return fuzzyEquals(a.x, b.x) && fuzzyEquals(a.y, b.y)
	}

	public static normalize(v: Vector2): Vector2 {
		const magnitude = v.magnitude

		if (magnitude == 0)
			throw new Error('Cannot normalize a 0 vector')

		return Vector2.divide(v, magnitude)
	}

	public static dot(v1: Vector2, v2: Vector2): number {
		return v1.x * v2.x + v1.y * v2.y
	}
	public static cross(v1: Vector2, v2: Vector2): number {
		return v1.x * v2.y - v1.y * v2.x
	}

	static rotate(v: Vector2, angle: number): Vector2 {
		const cos = Math.cos(angle)
		const sin = Math.sin(angle)

		const x = v.x * cos - v.y * sin
		const y = v.x * sin + v.y * cos

		return new Vector2(x, y)
	}

	public static transform(t: Transform, v: Vector2): Vector2 {
		return Vector2.add(
			Vector2.rotate(v, t.rotation),
			t.position
		)
	}

	public get negative(): Vector2 {
		return new Vector2(-this.x, -this.y)
	}
	public get perpendicular(): Vector2 {
		return new Vector2(-this.y, this.x)
	}

	public get magnitudeSquared(): number {
		return this.x * this.x + this.y * this.y
	}
	public get magnitude(): number {
		return Math.sqrt(this.magnitudeSquared)
	}
}