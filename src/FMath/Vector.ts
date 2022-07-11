import { Transform } from "@Physics/Transform"

export class Vector {
    public static readonly ZERO = new Vector(0, 0)

    public static add(a: Vector, b: Vector): Vector {
        return new Vector(a.x + b.x, a.y + b.y)
    }
    public static sub(a: Vector, b: Vector): Vector {
        return new Vector(a.x - b.x, a.y - b.y)
    }
    public static mul(v: Vector, s: number): Vector {
        return new Vector(v.x * s, v.y * s)
    }
    public static div(v: Vector, s: number): Vector {
        return new Vector(v.x / s, v.y / s)
    }

    public static transform(v: Vector, t: Transform): Vector {
        return new Vector(
            t.cos * v.x - t.sin * v.y + t.position.x,
            t.sin * v.x + t.cos * v.y + t.position.y
        )
    }
    
    public constructor(
        public readonly x: number,
        public readonly y: number
    ) {}

    public get negative(): Vector {
        return new Vector(-this.x, -this.y)
    }

    public equals(other: Vector): boolean {
        return this.x == other.x && this.y == other.y
    }
    public toString(radix?: number): string {
        return `x: ${this.x.toString(radix)}, y: ${this.y.toString(radix)}`
    }
}