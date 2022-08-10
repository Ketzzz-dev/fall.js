import { Vector } from './Vector'

export class Transform {
    public position: Vector

    public scale = Vector.ZERO
    public rotation = 0

    public constructor (position: Vector) {
        this.position = position
    }
}