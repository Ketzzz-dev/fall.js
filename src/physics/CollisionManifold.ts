import { Pair } from '../utility/Pair'
import { RigidBody } from './RigidBody'
import { Vector } from './Vector'

export interface CollisionPoints {
    contacts: Pair<Vector>

    normal: Vector
    depth: number
}

export class CollisionManifold {
    public readonly bodies: Pair<RigidBody>
    public readonly points: CollisionPoints

    public constructor (a: RigidBody, b: RigidBody, points: CollisionPoints) {
        this.bodies = new Pair(a, b)
        this.points = points
    }
}