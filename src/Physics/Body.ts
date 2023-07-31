import { Vector2 } from '../Math/Vector2'
import { Collider } from './Collider'
import { Material } from './Material'
import { Transform } from './Transform'
import Circle = Collider.Circle
import Polygon = Collider.Polygon
import Capsule = Collider.Capsule

export class Body {
	public linearVelocity = Vector2.ZERO
	public rotationalVelocity = 0
	public force = Vector2.ZERO
	public torque = 0

	public readonly mass: number
	public readonly inverseMass: number
	public readonly inertia: number
	public readonly inverseInertia: number

	public constructor(
		public readonly transform: Transform,
		public readonly collider: Collider,
		public readonly material: Material,
		public readonly isStatic = false
	) {
		if (isStatic) {
			// infinite mass
			this.mass = 0
			this.inverseMass = 0
			this.inertia = 0
			this.inverseInertia = 0
		} else {
			this.mass = collider.area * material.density
			this.inverseMass = this.mass != 0 ? 1 / this.mass : 0
			this.inertia = this.calculateInertia()
			this.inverseInertia = this.inertia !	= 0 ? 1 / this.inertia : 0
		}
	}

	public applyForce(force: Vector2, point: Vector2 = Vector2.ZERO): void {
		if (this.isStatic) return

		this.force = Vector2.add(this.force, force)
		this.torque += Vector2.cross(point, force)
	}

	public applyImpulse(impulse: Vector2, point: Vector2 = Vector2.ZERO): void {
		if (this.isStatic) return

		this.linearVelocity = Vector2.add(this.linearVelocity, Vector2.multiply(impulse, this.inverseMass))
		this.rotationalVelocity += Vector2.cross(point, impulse) * this.inverseInertia
	}

	public update(deltaTime: number): void {
		if (this.isStatic) return

		const linearAcceleration = Vector2.multiply(this.force, this.inverseMass)
		const rotationalAcceleration = this.torque * this.inverseInertia

		// RK4 (Runge-Kutta 4th order), better than Euler's method and Verlet integration
		// k_1 = yn
		const k1p = this.linearVelocity
		const k1lv = linearAcceleration
		const k1r = this.rotationalVelocity
		const k1rv = rotationalAcceleration

		const deltaTimeOverTwo = deltaTime / 2

		// h is deltaTime
		// k_2 = yn + h(k_1/2)
		const k2p = Vector2.add(this.linearVelocity, Vector2.multiply(k1p, deltaTimeOverTwo))
		const k2lv = Vector2.add(linearAcceleration, Vector2.multiply(k1lv, deltaTimeOverTwo))
		const k2r = this.rotationalVelocity + k1r * deltaTimeOverTwo
		const k2rv = rotationalAcceleration + k1rv * deltaTimeOverTwo

		// k_3 = yn + h(k_2/2)
		const k3p = Vector2.add(this.linearVelocity, Vector2.multiply(k2p, deltaTimeOverTwo))
		const k3lv = Vector2.add(linearAcceleration, Vector2.multiply(k2lv, deltaTimeOverTwo))
		const k3r = this.rotationalVelocity + k2r * deltaTimeOverTwo
		const k3rv = rotationalAcceleration + k2rv * deltaTimeOverTwo

		// k_4 = yn + h_k3
		const k4p = Vector2.add(this.linearVelocity, Vector2.multiply(k3p, deltaTime))
		const k4lv = Vector2.add(linearAcceleration, Vector2.multiply(k3lv, deltaTime))
		const k4r = this.rotationalVelocity + k3r * deltaTime
		const k4rv = rotationalAcceleration + k3rv * deltaTime

		const deltaTimeOverSix = deltaTime / 6

		// weighted average of the last 4 points
		const dp = Vector2.multiply(
			Vector2.add(
				k1p,
				Vector2.multiply(k2p, 2),
				Vector2.multiply(k3p, 2),
				k4p
			),
			deltaTimeOverSix
		)
		const dlv = Vector2.multiply(
			Vector2.add(
				k1lv,
				Vector2.multiply(k2lv, 2),
				Vector2.multiply(k3lv, 2),
				k4lv
			),
			deltaTimeOverSix
		)
		const dr = (k1r + 2 * k2r + 2 * k3r + k4r) * deltaTimeOverSix
		const drv = (k1rv + 2 * k2rv + 2 * k3rv + k4rv) * deltaTimeOverSix

		this.transform.position = Vector2.add(this.transform.position, dp)
		this.linearVelocity = Vector2.add(this.linearVelocity, dlv)
		this.transform.rotation += dr
		this.rotationalVelocity += drv

		// reset net force and torque
		this.force = Vector2.ZERO
		this.torque = 0
	}

	private calculateInertia(): number {
		if (this.collider instanceof Circle) {
			// 1/2mr^2
			return .5 * this.mass * this.collider.radius * this.collider.radius
		} else if (this.collider instanceof Polygon) {
			// err, IDK how to name
			let num = 0
			let den = 0

			for (let i = 0; i < this.collider.vertices.length; i++) {
				const currentVertex = this.collider.vertices[i]
				const nextVertex = i + 1 < this.collider.vertices.length ? this.collider.vertices[i + 1] : this.collider.vertices[0]

				const cross = Vector2.cross(nextVertex, currentVertex)
				const dot = Vector2.dot(currentVertex, nextVertex)

				num += cross * (currentVertex.magnitudeSquared + dot + nextVertex.magnitudeSquared)
				den += cross
			}

			return (this.mass / 6) * (num / den)
		} else if (this.collider instanceof Capsule) {
			// 1/2mr^2 + 1/12m(2r^2 + l^2) simplified to
			// (8mr^2 + l^2m)/12
			return (this.collider.length * this.collider.length * this.mass + 8 * this.mass * this.collider.radius * this.collider.radius) / 12
		} else throw new TypeError('Unknown collider type')
	}
}