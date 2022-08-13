import { Vector } from './Vector'

export class Transform {
    public position: Vector
    public rotation: number

    public constructor (position: Vector, rotation = 0) {
        this.position = position
        this.rotation = rotation
    }
}