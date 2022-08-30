import { FMath } from './FMath'
import { Transform } from './Transform'

export class Vector {
    public static readonly ZERO = new Vector(0, 0)
    public static readonly ONE = new Vector(1, 1)
    public static readonly LEFT = new Vector(-1, 0)
    public static readonly RIGHT = new Vector(1, 0)
    public static readonly UP = new Vector(0, -1)
    public static readonly DOWN = new Vector(0, 1)

    public static add(a: Vector, b: Vector): Vector {
        return new Vector(a.x + b.x, a.y + b.y)
    }
    public static subtract(a: Vector, b: Vector): Vector {
        return new Vector(a.x - b.x, a.y - b.y)
    }
    public static multiply(scalar: number, vector: Vector): Vector
    public static multiply(vector: Vector, scalar: number): Vector
    public static multiply(a: Vector | number, b: Vector | number): Vector {
        if (typeof a == 'number' && typeof b == 'object') return new Vector(a * b.x, a * b.y)
        else if (typeof a == 'object' && typeof b == 'number') return new Vector(a.x * b, a.y * b)
        
        throw new TypeError('Argument \'a\' must be of type \'Vector\' while Argument \'b\' must be of type \'number\', or vice versa.')
    }
    public static divide(scalar: number, vector: Vector): Vector
    public static divide(vector: Vector, scalar: number): Vector
    public static divide(a: Vector | number, b: Vector | number): Vector {
        if (typeof a == 'number' && typeof b == 'object') return new Vector(a / b.x, a / b.y)
        else if (typeof a == 'object' && typeof b == 'number') return new Vector(a.x / b, a.y / b)
        
        throw new TypeError('Argument \'a\' must be of type \'Vector\' while Argument \'b\' must be of type \'number\', or vice versa.')
    }
    public static equals(a: Vector, b: Vector): boolean {
        return a.x == b.x && a.y == b.y
    }

    public static transform(v: Vector, transform: Transform): Vector {
        let { position, orientation, scale } = transform

        return Vector.add(
            FMath.rotate(Vector.multiply(v, scale), orientation),
            position
        )
    }

    public readonly x: number
    public readonly y: number

    public get negative(): Vector {
        return new Vector(-this.x, -this.y)
    }

    public get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    public get magnitudeSq(): number {  
        return this.x * this.x + this.y * this.y
    }
    public get normalized(): Vector {
        let { magnitude } = this

        return new Vector(this.x / magnitude, this.y / magnitude)
    }
    
    public constructor (x: number, y: number) {
        this.x = x
        this.y = y
    }

    public toString(): string {
        return `x: ${this.x}, y: ${this.y}`
    }
}