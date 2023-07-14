import { Vector2 } from '../Math/Vector2'
import { Body } from './Body'
import { BoundingBox } from './BoundingBox'
import { Collisions } from './Collisions'
import CollisionInfo = Collisions.CollisionInfo

export class World {
	private bodies: Body[] = []

	public collisions: CollisionInfo[] = []

	public constructor(
		private readonly gravity = new Vector2(0, 9.81),
		private readonly slop = .0041,
		private readonly percent = .67
	) {
	}

	public addBodies(...bodies: Body[]): void {
		this.bodies.push(...bodies)
	}

	public removeBodies(...bodies: Body[]): void {
		for (const body of bodies) {
			const i = this.bodies.indexOf(body)

			if (i > 0) this.bodies.splice(i, 1)
		}
	}

	public getBodies(): readonly Body[] {
		return this.bodies
	}

	public update(deltaTime: number): void {
		const pairs = [] as [Body, Body][]

		this.collisions = []

		for (let i = 0; i < this.bodies.length; i++) {
			const bodyA = this.bodies[i]

			for (let j = i + 1; j < this.bodies.length; j++) {
				const bodyB = this.bodies[j]

				if (bodyA.isStatic && bodyB.isStatic) continue
				if (BoundingBox.intersects(bodyA.collider.getBoundingBox(bodyA.transform), bodyB.collider.getBoundingBox(bodyB.transform)))
					pairs.push([bodyA, bodyB])
			}
		}
		for (const [bodyA, bodyB] of pairs) {
			const collisionInfo = Collisions.testCollision(bodyA, bodyB)

			if (collisionInfo) this.resolveCollision(bodyA, bodyB, collisionInfo), this.collisions.push(collisionInfo)
		}
		for (const body of this.bodies) {
			body.applyForce(Vector2.multiply(this.gravity, body.mass))
			body.update(deltaTime)
		}
	}
	public resolveCollision(bodyA: Body, bodyB: Body, collisionInfo: CollisionInfo): void {
		const { penetration, contactPoints, normal } = collisionInfo

		const totalInverseMass = bodyA.inverseMass + bodyB.inverseMass
		const correction = Vector2.multiply(
			Vector2.multiply(normal, this.percent),
			(Math.max(penetration - this.slop, 0) / totalInverseMass)
		)
		// const correction = Vector2.multiply(normal, penetration)

		if (!bodyA.isStatic)
			bodyA.transform.position = Vector2.subtract(bodyA.transform.position, Vector2.multiply(correction, bodyA.inverseMass))
		if (!bodyB.isStatic)
			bodyB.transform.position = Vector2.add(bodyB.transform.position, Vector2.multiply(correction, bodyB.inverseMass))

		const restitution = .5 * (bodyA.material.restitution + bodyB.material.restitution)
		const staticFriction = .5 * (bodyA.material.staticFriction + bodyB.material.staticFriction)
		const dynamicFriction = .5 * (bodyA.material.dynamicFriction + bodyB.material.dynamicFriction)
		const impulseInfos = [] as { impulse: Vector2, radiusA: Vector2, radiusB: Vector2 }[]

		for (const contactPoint of contactPoints) {
			const radiusA = Vector2.subtract(contactPoint, bodyA.transform.position)
			const radiusB = Vector2.subtract(contactPoint, bodyB.transform.position)

			const perpendicularRadiusA = radiusA.perpendicular
			const perpendicularRadiusB = radiusB.perpendicular

			const rotationalVelocityA = Vector2.multiply(perpendicularRadiusA, bodyA.rotationalVelocity)
			const rotationalVelocityB = Vector2.multiply(perpendicularRadiusB, bodyB.rotationalVelocity)

			const fullVelocityA = Vector2.add(bodyA.linearVelocity, rotationalVelocityA)
			const fullVelocityB = Vector2.add(bodyB.linearVelocity, rotationalVelocityB)

			const relativeVelocity = Vector2.subtract(fullVelocityB, fullVelocityA)
			const contactVelocity = Vector2.dot(relativeVelocity, normal)

			if (contactVelocity > 0) continue

			// idfk what to call these
			const dotA = Vector2.dot(perpendicularRadiusA, normal)
			const dotB = Vector2.dot(perpendicularRadiusB, normal)
			const inertiaSum = dotA * dotA * bodyA.inverseInertia + dotB * dotB * bodyB.inverseInertia

			let normalImpulseScalar = -(1 + restitution) * contactVelocity / (totalInverseMass + inertiaSum)

			normalImpulseScalar /= contactPoints.length

			const normalImpulse = Vector2.multiply(normal, normalImpulseScalar)

			impulseInfos.push({ impulse: normalImpulse, radiusA, radiusB })

			let tangent = Vector2.subtract(relativeVelocity, Vector2.multiply(normal, Vector2.dot(relativeVelocity, normal)))

			if (!Vector2.fuzzyEquals(tangent, Vector2.ZERO)) tangent = Vector2.normalize(tangent)
			else continue

			let tangentImpulseScalar = -Vector2.dot(relativeVelocity, tangent) / (totalInverseMass + inertiaSum)

			tangentImpulseScalar /= contactPoints.length

			let tangentImpulse: Vector2

			if (Math.abs(tangentImpulseScalar) <= normalImpulseScalar * staticFriction) {
				tangentImpulse = Vector2.multiply(tangent, tangentImpulseScalar)
			} else {
				tangentImpulse = Vector2.multiply(tangent, -normalImpulseScalar * dynamicFriction)
			}

			impulseInfos.push({ impulse: tangentImpulse, radiusA, radiusB })
		}
		for (const { impulse, radiusA, radiusB } of impulseInfos) {
			// console.log(impulse.magnitude)

			bodyA.applyImpulse(impulse.negative, radiusA)
			bodyB.applyImpulse(impulse, radiusB)
		}
	}
}