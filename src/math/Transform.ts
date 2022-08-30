import { Vector } from './Vector'

export class Transform {
    public position: Vector
    public scale: number
    public orientation: number

    public constructor (position = Vector.ZERO, scale = 1, orientation = 0) {
        this.position = position
        this.scale = scale
        this.orientation = orientation
    }

    public translate(amount: Vector): void {
        this.position = Vector.add(this.position, amount)
    }

    public rotate(amount: number): void {
        this.orientation += amount
    }
}