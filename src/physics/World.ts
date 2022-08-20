import { MathF } from '../utility/MathF'
import { Vector } from './Vector'
import { RigidBody } from './RigidBody'
import { CollisionManifold } from './CollisionManifold'
import { Collisions } from './Collisions'

export class World {
    private _bodies = [] as RigidBody[]
    private _gravity = new Vector(0, 0)

    public points = [] as Vector[]
    
    public addBody(body: RigidBody): void {
        this._bodies.push(body)
    }
    public deleteBody(body: RigidBody): void {
        if (!this._bodies.includes(body)) return

        this._bodies = this._bodies.splice(this._bodies.indexOf(body), 1)
    }

    public step(delta: number): void {
        for (let body of this._bodies) body.step(delta, this._gravity)
        
        let collisions = Array<CollisionManifold>()

        for (let a of this._bodies) {
            for (let b of this._bodies) {
                if (a == b) break
                if (a.isStatic && b.isStatic) continue 

                let points = Collisions.collides(a, b)

                if (points) collisions.push(new CollisionManifold(a, b, points))
            }
        }

        this.points = []

        for (let collision of collisions) this.resolveCollision(collision), !this.points.includes(collision.points.contact) && this.points.push(collision.points.contact)
    }

    public resolveCollision(collision: CollisionManifold): void {
        let { bodies: { a, b }, points: { normal, depth, contact } } = collision

        let transformA = a.transform
        let transformB = b.transform

        let totalMass = a.inverseMass + b.inverseMass
        let penetration = Vector.multiply(normal, depth)

        if (!a.isStatic) transformA.position = Vector.subtract(a.transform.position, Vector.multiply(penetration, a.inverseMass / totalMass))
        if (!b.isStatic) transformB.position = Vector.add(b.transform.position, Vector.multiply(penetration, b.inverseMass / totalMass))

        let ra = Vector.subtract(contact, transformA.position)
        let rb = Vector.subtract(contact, transformB.position)

        let rv = Vector.subtract(
            Vector.add(b.linearVelocity, MathF.cross(b.angularVelocity, rb)),
            Vector.subtract(a.linearVelocity, MathF.cross(a.angularVelocity, ra))
        )

        let contactVelocity = MathF.dot(rv, normal)

        if (contactVelocity > 0) return

        let raxN = MathF.cross(ra, normal)
        let rbxN = MathF.cross(rb, normal)

        let invMassSum = totalMass + (raxN * raxN) * a.inverseInertia + (rbxN * rbxN) * b.inverseInertia

        let restitution = .5 * (a.restitution + b.restitution)

        let j = (-(1 + restitution) * contactVelocity) / invMassSum

        let impulse = Vector.multiply(normal, j)

        if (!a.isStatic) {
            a.linearVelocity = Vector.subtract(a.linearVelocity, Vector.multiply(a.inverseMass, impulse))
            a.angularVelocity -= a.inverseInertia * MathF.cross(ra, impulse)
        }
        if (!b.isStatic) {
            b.linearVelocity = Vector.add(b.linearVelocity, Vector.multiply(b.inverseMass, impulse))
            b.angularVelocity += b.inverseInertia * MathF.cross(rb, impulse)
        }

        // let relativeVelocity = Vector.subtract(b.linearVelocity, a.linearVelocity)
        
        // let restitution = .5 * (a.restitution + b.restitution)

        // let j = (-(1 + restitution) * MathF.dot(relativeVelocity, normal)) / totalMass

        // let impulse = Vector.multiply(normal, j)

        // if (!a.isStatic) a.linearVelocity = Vector.subtract(a.linearVelocity, Vector.multiply(impulse, a.inverseMass))
        // if (!b.isStatic) b.linearVelocity = Vector.add(b.linearVelocity, Vector.multiply(impulse, b.inverseMass))
    }
}