/**
 * A struct that stores a point in a 2-dimensional space.
 */
export class Vector {
    /**
     * A static constant that stores 0 for `x` and `y`.
     */
    public static readonly ZERO = new Vector(0, 0)

    /**
     * Returns the sum of 2 vectors.
     * 
     * @param a The left hand side vector.
     * @param b The right hand side vector.
     */
    public static add(a: Vector, b: Vector): Vector {
        return new Vector(a.x + b.x, a.y + b.y)
    }
    /**
     * Returns the difference of 2 vectors.
     * 
     * @param a The left hand side vector.
     * @param b The right hand side vector.
     */
    public static subtract(a: Vector, b: Vector): Vector {
        return new Vector(a.x - b.x, a.y - b.y)
    }
    /**
     * Returns the product of a vector multiplied to a scalar.
     * 
     * @param v The left hand side vector.
     * @param x The right hand side scalar.
     */
    public static multiply(v: Vector, x: number): Vector
    /**
     * Returns the product of a scalar multiplied to a vector.
     * 
     * @param x The left hand side scalar.
     * @param v The right hand side vector.
     */
    public static multiply(x: number, v: Vector): Vector
    public static multiply(a: Vector | number, b: Vector | number): Vector {
        if (typeof a == 'object')
            return new Vector(a.x * (b as number), a.y * (b as number))
        else
            return new Vector(a * (b as Vector).x, a * (b as Vector).y)
    }
    /**
     * Returns the quotient of a vector divided by a scalar.
     * 
     * @param v The left hand side vector.
     * @param x The right hand side scalar.
     */
    public static divide(v: Vector, x: number): Vector
    /**
     * Returns the quotient of a scalar divided by a vector.
     *
     * @param x The right hand side scalar.
     * @param v The left hand side vector.
     */
    public static divide(x: number, v: Vector): Vector
    public static divide(a: Vector | number, b: Vector | number): Vector {
        if (typeof a == 'object')
            return new Vector(a.x / (b as number), a.y / (b as number))
        else
            return new Vector(a / (b as Vector).x, a / (b as Vector).y)
    }
    /**
     * Returns a boolean value that determines whether 'a' and 'b' are in the same point in space.
     * 
     * @param a The left hand side comparator.
     * @param b The right hand side comparator.
     */
    public static equals(a: Vector, b: Vector): boolean {
        return a.x == b.x && a.y == b.y
    }

    /**
     * A number that stores the x component of the vector.
     */
    public readonly x: number
    /**
     * A number that stores the y component of the vector.
     */
    public readonly y: number

    /**
     * A vector that stores the negative `x` and `y` of the vector.
     */
    public get negative(): Vector {
        return new Vector(-this.x, -this.y)
    }
    /**
     * A number that stores the magnitude (length) of the vector, squared.
     */
    public get magnitudeSq(): number {
        return this.x * this.x + this.y * this.y
    }
    /**
     * A number that stores the magnitude (length) of the vector.
     */
    public get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    /**
     * A vector that stores the normalized form of the vector.
     */
    public get normalized(): Vector {
        let { magnitude } = this

        return new Vector(this.x / magnitude, this.y / magnitude)
    }
    
    /**
     * @param x The x component.
     * @param y The y component.
     */
    public constructor (x: number, y: number) {
        this.x = x
        this.y = y
    }

    /**
     * Returns the string represantation of a vector.
     */
    public toString(): string {
        return `x: ${this.x}, y: ${this.y}`
    }
}