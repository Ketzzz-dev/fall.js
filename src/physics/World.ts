import { FMath } from '../utility/FMath'
import { Vector } from './Vector'
import { RigidBody } from './RigidBody'
import { CollisionManifold } from './collisions/CollisionManifold'
import { Collisions } from './collisions/Collisions'

export class World {
    private _bodies = Array<RigidBody>()
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

        let totalMass = a.inverseMass + b.inverseMass
        let penetration = Vector.multiply(normal, depth)

        if (!a.isStatic) a.transform.position = Vector.subtract(a.transform.position, Vector.multiply(penetration, a.inverseMass / totalMass))
        if (!b.isStatic) b.transform.position = Vector.add(b.transform.position, Vector.multiply(penetration, b.inverseMass / totalMass))

        let relativeVelocity = Vector.subtract(b.linearVelocity, a.linearVelocity)
        
        let restitution = .5 * (a.restitution + b.restitution)

        let j = (-(1 + restitution) * FMath.dot(relativeVelocity, normal)) / totalMass

        let impulse = Vector.multiply(normal, j)

        if (!a.isStatic) a.linearVelocity = Vector.subtract(a.linearVelocity, Vector.multiply(impulse, a.inverseMass))
        if (!b.isStatic) b.linearVelocity = Vector.add(b.linearVelocity, Vector.multiply(impulse, b.inverseMass))
    }
}