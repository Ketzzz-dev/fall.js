import { Vector } from './Vector'

export namespace FMath {
    export const TWO_PI = 2 * Math.PI
    export const PI_OVER_TWO = Math.PI / 2
    export const PI_OVER_FOUR = Math.PI / 4

    export function distance(a: Vector, b: Vector): number {
        let deltaX = a.x - b.x
        let deltaY = a.y - b.y
        
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
    export function distanceSq(a: Vector, b: Vector): number {
        let deltaX = a.x - b.x
        let deltaY = a.y - b.y

        return deltaX * deltaX + deltaY * deltaY
    }

    export function dot(a: Vector, b: Vector): number {
        return a.x * b.x + a.y * b.y
    }

    // cross (wedge) product 
    export function cross(scalar: number, vector: Vector): Vector
    export function cross(vector: Vector, scalar: number): Vector
    export function cross(a: Vector, b: Vector): number
    export function cross(a: Vector | number, b: Vector | number): Vector | number {
        if (typeof a == 'number' && typeof b == 'object') return new Vector(-a * b.y, a * b.x)
        else if (typeof a == 'object' && typeof b == 'number') return new Vector(a.y * b, -a.x * b)
        else if (typeof a == 'object' && typeof b == 'object') return a.x * b.y - a.y * b.x
        
        throw new TypeError('Argument \'a\' must be of type \'Vector\' while Argument \'b\' must be of type \'number\', vice versa, or both must be of type \'Vector\'.')
    }

    export function rotate(vector: Vector, angle: number, origin = Vector.ZERO): Vector {
        let sin = Math.sin(angle)
        let cos = Math.cos(angle)

        let deltaX = vector.x - origin.x
        let deltaY = vector.y - origin.y

        let rotatedX = cos * deltaX - sin * deltaY
        let rotatedY = sin * deltaX + cos * deltaY

        return new Vector(
            rotatedX + origin.x,
            rotatedY + origin.y
        )
    }

    export function clamp(value: number, min = 0, max = 1): number {
        if (min == max) return min
        if (min > max) throw new RangeError('Argument \'min\' is greater than the argument \'max\'.')

        return value <= min ? min : value >= max ? max : value
    }
    
    export function fuzzyEquals(a: number, b: number, epsilon?: number): boolean
    export function fuzzyEquals(a: Vector, b: Vector, epsilon?: number): boolean
    // using this magic number instead of Number.EPSILON
    export function fuzzyEquals(a: Vector | number, b: Vector | number, epsilon = .0001): boolean {
        if (typeof a == 'number' && typeof b == 'number') return Math.abs(a - b) <= epsilon
        else if (typeof a == 'object' && typeof b == 'object') return Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon
        
        throw new TypeError('Arguments \'a\' and \'b\' must be of type \'number\' or \'Vector\'.')
    }
}