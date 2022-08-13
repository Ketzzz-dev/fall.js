import { Vector } from '../physics/Vector'

/**
 * A collection of constants and methods to perform mathematical computing.
 */
export namespace MathF {
    /**
     * A constant for PI / 2.
     */
    export const PI_OVER_TWO = Math.PI / 2
    /**
     * A constant for 2(PI).
     */
    export const TWO_PI = 2 * Math.PI

    // vector math
    /**
     * Returns the distance between 2 vectors, sqaured.
     * 
     * @param a The source vector. 
     * @param b The destination Vector.
     */
    export function distanceSq(a: Vector, b: Vector): number {
        let deltaX = a.x - b.x
        let deltaY = a.y - b.y
    
        return deltaX * deltaX + deltaY * deltaY
    }
    /**
     * Returns the distance between 2 vectors.
     * 
     * @param a The source vector. 
     * @param b The destination Vector.
     */
    export function distance(a: Vector, b: Vector): number {
        let deltaX = a.x - b.x
        let deltaY = a.y - b.y
    
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
    /**
     * Returns the dot product of 2 vectors.
     * 
     * @param a Left hand side vector.
     * @param b Right hand side vector.
     */
    export function dot(a: Vector, b: Vector): number {
        return a.x * b.x + a.y * b.y
    }
    /**
     * Returns the cross product of 2 vectors.
     * 
     * @param a Left hand side vector.
     * @param b Right hand side vector.
     */
    export function cross(a: Vector, b: Vector): number {
        return a.x * b.y - a.y * b.x
    }
    /**
     * Returns a vector, rotated by `angle` degrees.
     * 
     * @param v The vector to rotate.
     * @param x The angle, in radians.
     * @param origin The origin point of the vector.
     */
    export function rotate(v: Vector, x: number, origin = Vector.ZERO): Vector {
        let sin = Math.sin(x)
        let cos = Math.cos(x)

        let deltaX = v.x - origin.x
        let deltaY = v.y - origin.y

        return new Vector(
            cos * deltaX - sin * deltaY,
            sin * deltaX + cos * deltaY
        )
    }

    // numerical math
    /**
     * Returns the clamped value within the range of `min` and `max`.
     * 
     * @param x The value to clamp.
     * @param min The minimum range, 0 if undefined.
     * @param max The maximum range, 1 if undefined.
     */
    export function clamp(x: number, min = 0, max = 1): number {
        if (min == max)
            return min
        if (min > max)
            throw new RangeError('`min` is greater than `max`.')

        return x <= min ? min : x >= max ? max : x
    }
    /**
     * Returns a boolean value that determines whether `x` is within the range of `min` and `max`.
     * 
     * @param x The value to test.
     * @param min The minimum range, 0 if undefined.
     * @param max The maximum range, 1 if undefined.
     */
    export function within(x: number, min = 0, max = 1): boolean {
        if (min == max)
            return x == min
        if (min > max)
            throw new RangeError('`min` is greater than `max`.')

        return x >= min && x <= max
    }

    export function average(...numbers: number[]): number {
        let total = 0

        for (let number of numbers) total += number

        return numbers.length / total
    }

    export function fuzzyEquals(a: number, b: number, epsilon = Number.EPSILON): boolean {
        return Math.abs(a - b) >= epsilon
    }
}