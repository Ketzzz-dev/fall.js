import { Vector } from '../physics/Vector'

/**
 * The namespace that provides constants and methods to perform mathematical computing.
 */
export namespace MathF {
    export const PI_OVER_TWO = Math.PI / 2
    export const TWO_PI = 2 * Math.PI

    // vector math
    /**
     * Returns the magnitude of a vector, squared.
     * 
     * @param v The vector to calculate.
     * @deprecated Use {@link Vector#magnitudeSq} instead
     */
    export function magnitudeSq(v: Vector): number {
        return v.x * v.x + v.y * v.y
    }
    /**
     * Returns the magnitude of a vector.
     * 
     * @param v The vector to calculate.
     * @deprecated Use {@link Vector#magnitude} instead
     */
    export function magnitude(v: Vector): number {
        return Math.sqrt(v.x * v.x + v.y * v.y)
    }
    /**
     * Returns the distance between 2 vectors, sqaured.
     * 
     * @param a The source vector. 
     * @param b The destination Vector.
     */
    export function distanceSqrd(a: Vector, b: Vector): number {
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
     * Returns the normalized form of a vector.
     * 
     * @param v The vector to calculate.
     * @deprecated Use {@link Vector#normalized} instead
     */
    export function normalize(v: Vector): Vector {
        let length = magnitude(v)

        return new Vector(v.x / length, v.y / length)
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
    export function rotate(v: Vector, x: number): Vector {
        let sin = Math.sin(x)
        let cos = Math.cos(x)

        return new Vector(
            cos * v.x - sin * v.y,
            sin * v.x + cos * v.y
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

        return x < min ? min : x > max ? max : x
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

        return x > min && x < max
    }
}