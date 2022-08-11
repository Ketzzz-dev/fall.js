import { Vector } from '../Vector'
import { Body } from '../Body'
import { Pair } from '../../utility/Pair'

/**
 * An interface that stores the point of contacts, the normal, and the depth from a collision.
 */
export interface CollisionPoints {
    /**
     * The first contact point.
     */
    a: Vector
    /**
     * The second contact point.
     */
    b: Vector

    /**
     * The normal of the collision.
     */
    normal: Vector
    /**
     * The depth of the collision.
     */
    depth: number
}

/**
 * A struct that stores the pair of bodies that collided and the points of collision.
 */
export class CollisionManifold {
    /**
     * The pair of bodies that collided.
     */
    public readonly pair: Pair<Body>
    /**
     * The points of contact.
     */
    public readonly points: CollisionPoints

    /**
     * @param a The first body.
     * @param b The second body.
     * @param points The points of contact.
     */
    public constructor (a: Body, b: Body, points: CollisionPoints) {
        this.pair = new Pair(a, b)
        this.points = points
    }
}