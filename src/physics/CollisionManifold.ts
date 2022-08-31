import { Vector } from '../math'
import { Pair } from '../util/Types'
import { RigidBody } from './RigidBody'

export class CollisionManifold {
    public readonly bodies: Pair<RigidBody>

    public points = [] as Vector[]
    public normal = Vector.ZERO
    public depth = 0

    public constructor (bodyA: RigidBody, bodyB: RigidBody) {
        this.bodies = [bodyA, bodyB]
    }
}