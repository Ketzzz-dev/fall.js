import { MathF } from '../utility/MathF'
import { Vector } from './Vector'
import { RigidBody } from './RigidBody'
import { CollisionManifold } from './CollisionManifold'
import { Collisions } from './Collisions'

export class World {
    private _bodies = [] as RigidBody[]
    private _gravity = new Vector(0, 9.81)
    
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
        for (let collision of collisions) this.resolveCollision(collision)
    }

    public resolveCollision(collision: CollisionManifold): void {
        let { bodies: { a, b }, points: { normal, depth, contacts } } = collision

        let transformA = a.transform
        let transformB = b.transform

        let totalMass = a.inverseMass + b.inverseMass
        let penetration = Vector.multiply(normal, depth)

        if (!a.isStatic) transformA.position = Vector.subtract(a.transform.position, Vector.multiply(penetration, a.inverseMass / totalMass))
        if (!b.isStatic) transformB.position = Vector.add(b.transform.position, Vector.multiply(penetration, b.inverseMass / totalMass))

        // let contactPoint = Vector.subtract(contacts.a, contacts.b)

        // let relativeA = Vector.subtract(contactPoint, transformA.position)
        // let relativeB = Vector.subtract(contactPoint, transformB.position)

        // let fullVelocityA = Vector.add(a.linearVelocity, MathF.cross(a.angularVelocity, relativeA))
        // let fullVelocityB = Vector.add(b.linearVelocity, MathF.cross(b.angularVelocity, relativeB))
        
        // let relativeVelocity = Vector.subtract(fullVelocityB, fullVelocityA)

        // let impulseForce = MathF.dot(relativeVelocity, normal)

        // if (impulseForce > 0) return

        // let inertiaA = MathF.cross(a.inverseInertia * MathF.cross(relativeA, normal), relativeA)
        // let inertiaB = MathF.cross(b.inverseInertia * MathF.cross(relativeB, normal), relativeB)

        // let angularEffect = MathF.dot(Vector.add(inertiaA, inertiaB), normal)

        // let restitution = .5 * (a.restitution + b.restitution)

        // let j = (-(1 + restitution) * impulseForce) / (totalMass + angularEffect)

        // let impulse = Vector.multiply(normal, j)

        // if (!a.isStatic) {
        //     a.linearVelocity = Vector.subtract(a.linearVelocity, Vector.multiply(impulse, a.inverseMass))
        //     a.angularVelocity -= MathF.cross(contactPoint, impulse) * a.inverseInertia
        // }
        // if (!b.isStatic) {
        //     b.linearVelocity = Vector.add(b.linearVelocity, Vector.multiply(impulse, b.inverseMass))
        //     b.angularVelocity += MathF.cross(contactPoint, impulse) * b.inverseInertia
        // }

        let relativeVelocity = Vector.subtract(b.linearVelocity, a.linearVelocity)
        
        let restitution = .5 * (a.restitution + b.restitution)

        let j = (-(1 + restitution) * MathF.dot(relativeVelocity, normal)) / totalMass

        let impulse = Vector.multiply(normal, j)

        if (!a.isStatic) a.linearVelocity = Vector.subtract(a.linearVelocity, Vector.multiply(impulse, a.inverseMass))
        if (!b.isStatic) b.linearVelocity = Vector.add(b.linearVelocity, Vector.multiply(impulse, b.inverseMass))
    }
}