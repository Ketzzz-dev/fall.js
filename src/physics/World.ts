import { AABB } from '../geometry'
import { Vector, FMath } from '../math'
import { CollisionManifold } from './CollisionManifold'
import { Collisions } from './Collisions'
import { RigidBody } from './RigidBody'

export class World {
    private _bodies = [] as RigidBody[]
    private _collisions = [] as CollisionManifold[]
    
    private _gravity = new Vector(0, 9.81)

    public get bodies(): readonly RigidBody[] {
        return this._bodies
    }
    
    public addBody(body: RigidBody): void {
        this._bodies.push(body)
    }
    public deleteBody(body: RigidBody): boolean {
        let i = this._bodies.indexOf(body)

        if (i < 0) return false

        this._bodies = this._bodies.splice(i, 1)

        return true
    }

    public update(delta: number): void {        
        for (let body of  this._bodies) {
            if (body.isStatic) continue

            body.force = Vector.add(body.force, Vector.multiply(body.mass, this._gravity))

            body.update(delta)
        }

        this._collisions = []
        
        for (let bodyA of this._bodies) {
            for (let bodyB of this._bodies) {
                if (bodyA == bodyB) break
                if (bodyA.isStatic && bodyB.isStatic) continue
                if (!AABB.overlaps(bodyA.collider.bounds, bodyB.collider.bounds)) continue

                let manifold = new CollisionManifold(bodyA, bodyB)

                if (Collisions.solve(manifold)) this._collisions.push(manifold)
            }
        }
        for (let collision of this._collisions) this.resolveCollision(collision) 
    }

    public resolveCollision(manifold: CollisionManifold): void {
        let { bodies: { a, b }, depth, normal, points } = manifold

        let transformA = a.transform
        let transformB = b.transform

        let totalInverseMass = a.inverseMass + b.inverseMass
        let correction = Vector.multiply(normal, depth / totalInverseMass)

        if (!a.isStatic) transformA.position = Vector.subtract(a.transform.position, Vector.multiply(correction, a.inverseMass))
        if (!b.isStatic) transformB.position = Vector.add(b.transform.position, Vector.multiply(correction, b.inverseMass))

        for (let point of points) {
            let centerMassA = Vector.subtract(point, transformA.position)
            let centerMassB = Vector.subtract(point, transformB.position)

            let fullVelocityA = Vector.add(a.linearVelocity, FMath.cross(a.angularVelocity, centerMassA))
            let fullVelocityB = Vector.add(b.linearVelocity, FMath.cross(b.angularVelocity, centerMassB))

            let relativeVelocity = Vector.subtract(fullVelocityB, fullVelocityA)
            let contactVelocity = FMath.dot(relativeVelocity, normal)

            if (contactVelocity > 0) return

            let raxn = FMath.cross(centerMassA, normal)
            let rbxn = FMath.cross(centerMassB, normal)
            let invMsIn = totalInverseMass + raxn * raxn * a.inverseInertia + rbxn * rbxn * b.inverseInertia

            let restitution = .5 * (a.material.restitution + b.material.restitution)

            let jn = -(1 + restitution) * contactVelocity / invMsIn

            jn /= points.length

            let normalImpulse = Vector.multiply(normal, jn)

            if (!a.isStatic) {
                a.linearVelocity = Vector.subtract(a.linearVelocity, Vector.multiply(a.inverseMass, normalImpulse))
                a.angularVelocity -= a.inverseInertia * FMath.cross(centerMassA, normalImpulse)
            }
            if (!b.isStatic) {
                b.linearVelocity = Vector.add(b.linearVelocity, Vector.multiply(b.inverseMass, normalImpulse))
                b.angularVelocity += b.inverseInertia * FMath.cross(centerMassB, normalImpulse)
            }
        }
    }
}