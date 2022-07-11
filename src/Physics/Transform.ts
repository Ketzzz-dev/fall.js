import { Vector } from "@FMath/Vector";

export class Transform {
    public static readonly ZERO = new Transform(Vector.ZERO, 0)

    public readonly position: Vector
    public readonly sin: number
    public readonly cos: number

    public constructor(position: Vector, angle: number) {
        this.position = position
        this.sin = Math.sin(angle)
        this.cos = Math.cos(angle)
    }
}