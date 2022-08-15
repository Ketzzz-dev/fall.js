import { Vector } from '../physics/Vector'

export class AABB {
    public readonly min: Vector
    public readonly max: Vector

    public static overlaps(a: AABB, b: AABB): boolean {
        return a.max.x >= b.min.x && a.min.x <= b.max.x &&
        a.max.y >= b.min.y && a.min.y <= b.max.y
    }

    public constructor (min: Vector, max: Vector) {
        this.min = min
        this.max = max
    }
}