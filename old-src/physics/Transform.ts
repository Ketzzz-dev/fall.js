import { Vector } from './Vector'

export class Transform {
    public position: Vector
    public scale: Vector
    public rotation: number

    public constructor (position: Vector, scale: Vector = Vector.ONE, rotation = 0) {
        this.position = position
        this.scale = scale
        this.rotation = rotation
    }
}