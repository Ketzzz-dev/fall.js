import { Vector } from '../physics/Vector'

export namespace FMath {
    export const TWO_PI = 2 * Math.PI
    export const PI_OVER_TWO = Math.PI / 2

    export function distanceSq(a: Vector, b: Vector): number {
        let deltaX = a.x - b.x
        let deltaY = a.y - b.y
    
        return deltaX * deltaX + deltaY * deltaY
    }
    export function distance(a: Vector, b: Vector): number {
        let deltaX = a.x - b.x
        let deltaY = a.y - b.y
    
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
    export function dot(a: Vector, b: Vector): number {
        return a.x * b.x + a.y * b.y
    }
    export function cross(a: Vector, b: Vector): number {
        return a.x * b.y - a.y * b.x
    }
    export function rotate(v: Vector, angle: number, origin = Vector.ZERO): Vector {
        let sin = Math.sin(angle)
        let cos = Math.cos(angle)

        let deltaX = v.x - origin.x
        let deltaY = v.y - origin.y

        let rotatedX = cos * deltaX - sin * deltaY
        let rotatedY = sin * deltaX + cos * deltaY

        return new Vector(
            rotatedX + origin.x,
            rotatedY + origin.y
        )
    }
    export function clamp(x: number, min = 0, max = 1): number {
        if (min == max) return min
        if (min > max) throw new RangeError('Argument \'min\' is greater than the argument \'max\'.')

        return x <= min ? min : x >= max ? max : x
    }
    export function fuzzyEquals(a: number, b: number, epsilon?: number): boolean
    export function fuzzyEquals(a: Vector, b: Vector, epsilon?: number): boolean
    export function fuzzyEquals(a: Vector | number, b: Vector | number, epsilon = Number.EPSILON): boolean {
        if (typeof a == 'number' && typeof b == 'number') return Math.abs(a - b) < epsilon
        else if (typeof a == 'object' && typeof b == 'object') return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon
        
        throw new TypeError('Arguments \'a\' and \'b\' must be of type \'number\' or \'Vector\'.')
    }
}