import EventEmitter from 'eventemitter3'
import { AABB } from '../geometry'
import { Vector, FMath } from '../math'
import { Pair } from '../util/Types'
import { CollisionManifold } from './CollisionManifold'
import { Collisions } from './Collisions'
import { RigidBody } from './RigidBody'

export interface WorldEvents {
    
}

export class World extends EventEmitter<WorldEvents> {
    private _bodies = [] as RigidBody[]
    private _collisionPairs = [] as Pair<RigidBody>[]
    
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
        // stepping       
        for (let body of  this._bodies) {
            if (body.isStatic) continue

            body.force = Vector.add(body.force, Vector.multiply(body.mass, this._gravity))

            body.update(delta)
        }

        // broadphase
        this._collisionPairs = []

        for (let a of this._bodies) {
            for (let b of this._bodies) {
                if (a == b) break
                if (a.isStatic && b.isStatic) continue
                if (AABB.overlaps(a.collider.bounds, b.collider.bounds)) this._collisionPairs.push([a, b])
            }
        }
        // narrowphase
        for (let [a, b] of this._collisionPairs) {
            let manifold = new CollisionManifold(a, b)

            if (Collisions.solve(manifold)) this.resolveCollision(manifold)
        }
    }

    public resolveCollision(manifold: CollisionManifold): void {
        let { bodies: [a, b], depth, normal, points } = manifold

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

            if (!a.isStatic) a.applyImpulse(normalImpulse.negative, centerMassA)
            if (!b.isStatic) b.applyImpulse(normalImpulse, centerMassB)

            fullVelocityA = Vector.add(a.linearVelocity, FMath.cross(a.angularVelocity, centerMassA))
            fullVelocityB = Vector.add(b.linearVelocity, FMath.cross(b.angularVelocity, centerMassB))

            relativeVelocity = Vector.subtract(fullVelocityB, fullVelocityA)

            let tangent = Vector.subtract(relativeVelocity, Vector.multiply(normal, FMath.dot(relativeVelocity, normal))).normalized

            let jt = -FMath.dot(relativeVelocity, tangent) / invMsIn

            jt /= points.length

            if (FMath.fuzzyEquals(jt, 0)) return

            let staticFriction = Math.sqrt(a.material.staticFriction * a.material.staticFriction + b.material.staticFriction * b.material.staticFriction)

            let tangentImpulse: Vector
            
            if (Math.abs(jt) < jn * staticFriction) {
                tangentImpulse = Vector.multiply(tangent, jt)
            } else {
                let dynamicFriction = Math.sqrt(a.material.dynamicFriction * a.material.dynamicFriction + b.material.dynamicFriction * b.material.dynamicFriction)

                tangentImpulse = Vector.multiply(tangent, -jn * dynamicFriction)
            } 

            if (!a.isStatic) a.applyImpulse(tangentImpulse.negative, centerMassA)
            if (!b.isStatic) b.applyImpulse(tangentImpulse, centerMassB)
        }
    }
}