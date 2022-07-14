import { Vector } from "./Vector"

export function length(v: Vector): number {
    return Math.sqrt(v.x * v.x + v.y * v.y)
}
export function distance(a: Vector, b: Vector): number {
    let dX = a.x - b.x
    let dY = a.y - b.y

    return Math.sqrt(dX * dX + dY * dY)
}
export function normalize(v: Vector): Vector {
    let len = length(v)

    return new Vector(v.x / len, v.y / len)
}
export function dot(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y
}
export function cross(a: Vector, b: Vector): number {
    return a.x * b.y - a.y * b.x
}

export function clamp(x: number, min: number, max: number) {
    if (min == max)
        return min

    if (min > max)
        throw new RangeError('`min` is greater than `max`.')

    return x < min ? min : x > max ? max : x
}