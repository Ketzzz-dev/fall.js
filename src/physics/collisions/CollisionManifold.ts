import { Vector } from '../Vector'
import { Body } from '../Body'
import { Pair } from '../../utility/Pair'

export interface CollisionPoints {
    a: Vector
    b: Vector

    normal: Vector
    depth: number
}

export class CollisionManifold {
    public readonly pair: Pair<Body>
    public readonly points: CollisionPoints

    public constructor (a: Body, b: Body, points: CollisionPoints) {
        this.pair = new Pair(a, b)
        this.points = points
    }
}