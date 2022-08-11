import { Vector } from '../physics/Vector'

/**
 * A struct that stores a minimum and a maximum boundary.
 */
export class AABB {
    /**
     * The minimum of the boundary.
     */
    public readonly min: Vector
    /**
     * The maximum of the boundary.
     */
    public readonly max: Vector

    /**
     * Returns a boolean that determines whether 2 AABB's overlap.
     * 
     * @param a The main AABB to test.
     * @param b The target AABB to test.
     */
    public static overlaps(a: AABB, b: AABB): boolean {
        return a.max.x >= b.min.x && a.min.x <= b.max.x &&
        a.max.y >= b.min.y && a.min.y <= b.max.y
    }

    /**
     * @param min The minimum of the boundary.
     * @param max The minimum of the boundary.
     */
    public constructor (min: Vector, max: Vector) {
        this.min = min
        this.max = max
    }
}