import { MathF } from '../utility/MathF'
import { Vector } from './Vector'
import { Body } from './Body'
import { CollisionManifold } from './collisions/CollisionManifold'

export class World {
    private _bodies = Array<Body>()
    private _gravity = new Vector(0, 9.81)
    
    public addBody(body: Body): void {
        this._bodies.push(body)
    }
    public deleteBody(body: Body): void {
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

                let points = a.collider.testCollision(a.transform, b.collider, b.transform)

                if (points)
                    collisions.push(new CollisionManifold(a, b, points))
            }
        }

        for (let collision of collisions) this.resolveCollision(collision)
    }

    public resolveCollision(collision: CollisionManifold): void {
        let { pair: { a, b }, points } = collision

        let totalMass = a.inverseMass + b.inverseMass
        let separationAmount = Vector.multiply(points.normal, points.depth)

        if (!a.isStatic) a.transform.position = Vector.subtract(a.transform.position, Vector.multiply(separationAmount, a.inverseMass / totalMass))
        if (!b.isStatic) b.transform.position = Vector.add(b.transform.position, Vector.multiply(separationAmount, b.inverseMass / totalMass))

        // let contactVelocity = Vector.subtract(b.linearVelocity, a.linearVelocity)
        // let impulseForce = MathF.dot(contactVelocity, points.normal)

        // if (impulseForce > 0)
        //     return

        // let restitution = Math.max(a.restitution, b.restitution)
        // let impulseMagnitude = (-(1 + restitution) * impulseForce) / totalMass

        // let fullImpulse = Vector.multiply(points.normal, impulseMagnitude)

        // if (!a.isStatic) a.linearVelocity = Vector.subtract(a.linearVelocity, Vector.multiply(fullImpulse, a.inverseMass))
        // if (!b.isStatic) b.linearVelocity = Vector.add(b.linearVelocity, Vector.multiply(fullImpulse, b.inverseMass))
    }
}