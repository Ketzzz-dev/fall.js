import { Vector } from './Vector'
import { RigidBody } from './RigidBody'
import { CollisionManifold } from './CollisionManifold'
import { Collisions } from './Collisions'
import { FMath } from '../utility/FMath'

export class World {
    private _bodies = [] as RigidBody[]
    private _collisions = [] as CollisionManifold[]
    
    private _gravity = new Vector(0, 9.81)
    
    public addBody(body: RigidBody): void {
        this._bodies.push(body)
    }
    public deleteBody(body: RigidBody): boolean {
        let i = this._bodies.indexOf(body)

        if (i < 0) return false

        this._bodies = this._bodies.splice(i, 1)

        return true
    }

    public step(delta: number): void {        
        this._collisions = []

        for (let a of this._bodies) {
            for (let b of this._bodies) {
                if (a == b) break
                if (a.isStatic && b.isStatic) continue

                let points = Collisions.collides(a, b)

                if (points) this._collisions.push(new CollisionManifold(a, b, points))
            }
        }
        for (let collision of this._collisions) this.resolveCollision(collision) 

        for (let body of this._bodies) {
            body.force = Vector.add(body.force, Vector.multiply(body.mass, this._gravity))

            body.step(delta)
        }
    }

    public resolveCollision(manifold: CollisionManifold): void {
        let { bodies: { a, b }, points: { depth, normal, contacts } } = manifold

        let transformA = a.transform
        let transformB = b.transform

        let totalInverseMass = a.inverseMass + b.inverseMass
        let correction = Vector.multiply(normal, depth)

        if (!a.isStatic) transformA.position = Vector.subtract(a.transform.position, Vector.multiply(correction, a.inverseMass / totalInverseMass))
        if (!b.isStatic) transformB.position = Vector.add(b.transform.position, Vector.multiply(correction, b.inverseMass / totalInverseMass))

        for (let contact of contacts) {
            let radiusA = Vector.subtract(contact, transformA.position)
            let radiusB = Vector.subtract(contact, transformB.position)

            let fullVelocityA = Vector.add(a.linearVelocity, FMath.cross(a.angularVelocity, radiusA))
            let fullVelocityB = Vector.add(b.linearVelocity, FMath.cross(b.angularVelocity, radiusB))

            let relativeVelocity = Vector.subtract(fullVelocityB, fullVelocityA)
            let contactVelocity = FMath.dot(relativeVelocity, normal)

            if (contactVelocity > 0) return

            let raxn = FMath.cross(radiusA, normal)
            let rbxn = FMath.cross(radiusB, normal)
            let invMsIn = totalInverseMass + raxn * raxn * a.inverseInertia + rbxn * rbxn * b.inverseInertia

            let restitution = Math.sqrt(a.restitution * a.restitution + b.restitution * b.restitution)

            let jn = -(1 + restitution) * contactVelocity / invMsIn

            jn /= contacts.length

            let normalImpulse = Vector.multiply(normal, jn)

            if (!a.isStatic) {
                a.linearVelocity = Vector.subtract(a.linearVelocity, Vector.multiply(a.inverseMass, normalImpulse))
                a.angularVelocity -= a.inverseInertia * FMath.cross(radiusA, normalImpulse)
            }
            if (!b.isStatic) {
                b.linearVelocity = Vector.add(b.linearVelocity, Vector.multiply(b.inverseMass, normalImpulse))
                b.angularVelocity += b.inverseInertia * FMath.cross(radiusB, normalImpulse)
            }
        }
    }
}