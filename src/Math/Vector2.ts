import { Common } from './Common'
import { Transform } from '../Physics/Transform'
import fuzzyEquals = Common.fuzzyEquals

export class Vector2 {
	// constants
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

	public static add(v_a: Vector2, v_b: Vector2, ...v_n: Vector2[]): Vector2 {
		let sumX = v_a.x + v_b.x
		let sumY = v_a.y + v_b.y

		for (const v of v_n) {
			sumX += v.x
			sumY += v.y
		}

		return new Vector2(sumX, sumY)
	}
	public static subtract(v_a: Vector2, v_b: Vector2, ...v_n: Vector2[]): Vector2 {
		let differenceX = v_a.x - v_b.x
		let differenceY = v_a.y - v_b.y

		for (const v of v_n) {
			differenceX += v.x
			differenceY += v.y
		}

		return new Vector2(differenceX, differenceY)
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

	public static transform(v: Vector2, t: Transform): Vector2 {
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

	// using getters because these should only be calculated when needed
	public get magnitudeSquared(): number {
		return this.x * this.x + this.y * this.y
	}
	public get magnitude(): number {
		return Math.sqrt(this.magnitudeSquared)
	}
}